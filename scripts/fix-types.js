const fs = require('fs');
const path = require('path');

// 查找所有TypeScript文件
function findTypeScriptFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      findTypeScriptFiles(filePath, fileList);
    } else if (
      stat.isFile() && 
      (file.endsWith('.ts') || file.endsWith('.tsx'))
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 修复文件中的类型错误
function fixTypeErrors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 修复各种可能无类型的函数参数
  content = content.replace(
    /const\s+(\w+)\s*=\s*\(([^)]*)\)\s*=>/g,
    function(match, funcName, params) {
      // 如果参数已经有类型注解，保持不变
      if (params.includes(':')) return match;
      
      // 处理每个参数
      const newParams = params.split(',').map(param => {
        param = param.trim();
        if (!param || param.includes(':')) return param;
        return `${param}: any`;
      }).join(', ');
      
      return `const ${funcName} = (${newParams}) =>`;
    }
  );
  
  // 函数声明的参数也要处理
  content = content.replace(
    /function\s+(\w+)\s*\(([^)]*)\)/g,
    function(match, funcName, params) {
      if (params.includes(':')) return match;
      
      const newParams = params.split(',').map(param => {
        param = param.trim();
        if (!param || param.includes(':')) return param;
        return `${param}: any`;
      }).join(', ');
      
      return `function ${funcName}(${newParams})`;
    }
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`已修复: ${filePath}`);
}

// 扫描并修复特定文件
function fixSpecificFile(filePath) {
  if (fs.existsSync(filePath)) {
    fixTypeErrors(filePath);
    console.log(`已修复指定文件: ${filePath}`);
    return true;
  }
  return false;
}

// 主函数
function main() {
  // 优先修复已知有问题的文件
  const specificFiles = [
    path.join(process.cwd(), 'app', '(game)', 'exercises', '[id]', 'chat', 'page.tsx')
  ];
  
  let fixed = false;
  for (const file of specificFiles) {
    if (fixSpecificFile(file)) {
      fixed = true;
    }
  }
  
  // 如果没有找到特定文件，扫描所有文件
  if (!fixed) {
    console.log('未找到指定文件，将扫描所有TypeScript文件...');
    const rootDir = process.cwd();
    const tsFiles = findTypeScriptFiles(rootDir);
    
    tsFiles.forEach(file => {
      try {
        fixTypeErrors(file);
      } catch (err) {
        console.error(`处理文件 ${file} 时出错:`, err);
      }
    });
  }
}

main(); 
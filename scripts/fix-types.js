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
  
  // 修复 showToast 函数
  content = content.replace(
    /const showToast = \(message\) =>/g, 
    'const showToast = (message: string) =>'
  );
  
  // 修复其他常见问题
  content = content.replace(
    /const handleSubmit = async \(e\) =>/g, 
    'const handleSubmit = async (e: React.FormEvent) =>'
  );
  
  content = content.replace(
    /const addEmoji = \(emoji\) =>/g, 
    'const addEmoji = (emoji: string) =>'
  );
  
  fs.writeFileSync(filePath, content);
}

// 主函数
function main() {
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

main(); 
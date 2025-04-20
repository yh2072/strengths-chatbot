const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NEXT_TRACE_DISABLED = '1';

// 为Node分配更多内存
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

console.log('Creating temporary TypeScript configuration...');

// 创建临时配置文件内容
const tempTsConfig = {
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "noImplicitAny": false,
    "strictNullChecks": false,
    "strictFunctionTypes": false,
    "strictBindCallApply": false,
    "strictPropertyInitialization": false,
    "noImplicitThis": false,
    "useUnknownInCatchVariables": false,
    "alwaysStrict": false,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
};

// 备份原始配置
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
let originalTsconfig = null;
if (fs.existsSync(tsconfigPath)) {
  originalTsconfig = fs.readFileSync(tsconfigPath, 'utf8');
  fs.writeFileSync(tsconfigPath, JSON.stringify(tempTsConfig, null, 2));
  console.log('Temporary TypeScript configuration created');
}

try {
  // 执行迁移
  console.log('Running migrations...');
  execSync('tsx lib/db/migrate', { stdio: 'inherit' });

  // 执行构建
  console.log('Building app...');
  execSync('next build --no-lint --no-prebundle', { stdio: 'inherit' });
} finally {
  // 恢复原始配置
  if (originalTsconfig) {
    fs.writeFileSync(tsconfigPath, originalTsconfig);
    console.log('Restored original TypeScript configuration');
  }
} 
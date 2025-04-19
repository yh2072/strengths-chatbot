const { execSync } = require('child_process');

// 设置环境变量以跳过lint
process.env.SKIP_LINT = 'true';

// 执行迁移
console.log('Running migrations...');
execSync('tsx lib/db/migrate', { stdio: 'inherit' });

// 执行构建
console.log('Building app...');
execSync('next build --no-lint', { stdio: 'inherit' }); 
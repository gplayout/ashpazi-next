/**
 * Chef Technician - Technical Health Monitor Agent
 * 
 * This agent monitors the entire Zaffaron app for:
 * - Build errors
 * - API endpoint health
 * - Database connectivity
 * - Missing dependencies
 * - Code quality issues
 * 
 * Usage: node scripts/chef_technician.js [audit|fix|watch]
 * 
 * Commands:
 *   audit - Full technical audit of the app
 *   fix   - Attempt to auto-fix common issues
 *   watch - Continuous monitoring mode
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Load environment variables
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
}

const REPORT_PATH = path.resolve(__dirname, '../technical_report.md');

// Color helpers for console
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
    console.log(`${colors[color]}${msg}${colors.reset}`);
}

// ============ AUDIT CHECKS ============

const checks = {
    // 1. Environment Variables
    async checkEnvVars() {
        log('\n📋 Checking Environment Variables...', 'cyan');
        const required = [
            'NEXT_PUBLIC_SUPABASE_URL',
            'NEXT_PUBLIC_SUPABASE_ANON_KEY'
        ];
        // OpenAI key can have different names
        const hasOpenAI = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

        const missing = required.filter(key => !process.env[key]);

        if (!hasOpenAI) {
            missing.push('OPENAI_API_KEY or VITE_OPENAI_API_KEY');
        }

        if (missing.length > 0) {
            return {
                status: 'error',
                message: `Missing env vars: ${missing.join(', ')}`,
                fix: 'Add missing variables to .env.local'
            };
        }
        return { status: 'ok', message: 'All required env vars present' };
    },

    // 2. Package Dependencies
    async checkDependencies() {
        log('\n📦 Checking Dependencies...', 'cyan');
        try {
            const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
            const nodeModules = path.resolve(__dirname, '../node_modules');

            if (!fs.existsSync(nodeModules)) {
                return {
                    status: 'error',
                    message: 'node_modules not found',
                    fix: 'Run: npm install'
                };
            }

            // Check for critical packages
            const critical = ['next', 'react', '@supabase/supabase-js', 'openai'];
            const missingPkgs = critical.filter(pkg => !fs.existsSync(path.join(nodeModules, pkg)));

            if (missingPkgs.length > 0) {
                return {
                    status: 'error',
                    message: `Missing packages: ${missingPkgs.join(', ')}`,
                    fix: 'Run: npm install'
                };
            }

            return { status: 'ok', message: 'All critical dependencies installed' };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    },

    // 3. Database Connectivity
    async checkDatabase() {
        log('\n🗄️  Checking Database...', 'cyan');
        try {
            const { createClient } = require('@supabase/supabase-js');
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            );

            const { data, error } = await supabase.from('recipes').select('id').limit(1);

            if (error) {
                return {
                    status: 'error',
                    message: `DB Error: ${error.message}`,
                    fix: 'Check Supabase credentials and RLS policies'
                };
            }

            // Check for marketing tables
            const { error: blogError } = await supabase.from('blog_posts').select('id').limit(1);
            const { error: socialError } = await supabase.from('social_posts').select('id').limit(1);

            const missingTables = [];
            if (blogError?.code === '42P01') missingTables.push('blog_posts');
            if (socialError?.code === '42P01') missingTables.push('social_posts');

            if (missingTables.length > 0) {
                return {
                    status: 'warning',
                    message: `Missing tables: ${missingTables.join(', ')}`,
                    fix: 'Run db/marketing_schema.sql in Supabase SQL Editor'
                };
            }

            return { status: 'ok', message: 'Database connected, all tables exist' };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    },

    // 4. API Endpoints Health
    async checkApiEndpoints() {
        log('\n🔌 Checking API Endpoints...', 'cyan');
        const endpoints = [
            { path: '/api/search', method: 'GET', params: '?q=test' },
            { path: '/api/judge', method: 'POST' },
            { path: '/api/fridge', method: 'POST' }
        ];

        // Check if API route files exist
        const apiDir = path.resolve(__dirname, '../src/app/api');
        const issues = [];

        for (const ep of endpoints) {
            const routePath = path.join(apiDir, ep.path.replace('/api/', ''), 'route.js');
            if (!fs.existsSync(routePath)) {
                issues.push(`Missing: ${ep.path}`);
            } else {
                // Check for common issues in the file
                const content = fs.readFileSync(routePath, 'utf-8');
                if (!content.includes("export const dynamic = 'force-dynamic'")) {
                    issues.push(`${ep.path}: Missing dynamic export (may cause build issues)`);
                }
            }
        }

        if (issues.length > 0) {
            return {
                status: 'warning',
                message: issues.join('\n'),
                fix: 'Review API route files'
            };
        }

        return { status: 'ok', message: 'All API routes exist and configured' };
    },

    // 5. Build Check
    async checkBuild() {
        log('\n🏗️  Checking Build Configuration...', 'cyan');
        try {
            const nextConfig = path.resolve(__dirname, '../next.config.mjs');
            if (!fs.existsSync(nextConfig)) {
                return {
                    status: 'warning',
                    message: 'next.config.mjs not found',
                    fix: 'Create next.config.mjs with proper configuration'
                };
            }

            // Check for common Next.js issues
            const pagesDir = path.resolve(__dirname, '../src/app');
            if (!fs.existsSync(pagesDir)) {
                return {
                    status: 'error',
                    message: 'src/app directory not found',
                    fix: 'App Router structure is required'
                };
            }

            return { status: 'ok', message: 'Build configuration valid' };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    },

    // 6. Localization Check
    async checkLocalization() {
        log('\n🌍 Checking Localization...', 'cyan');
        try {
            const dictPath = path.resolve(__dirname, '../src/utils/dictionaries.js');
            if (!fs.existsSync(dictPath)) {
                return {
                    status: 'error',
                    message: 'dictionaries.js not found',
                    fix: 'Create src/utils/dictionaries.js'
                };
            }

            const content = fs.readFileSync(dictPath, 'utf-8');
            const languages = ['fa', 'en', 'es'];
            const missing = languages.filter(lang => !content.includes(`${lang}:`));

            if (missing.length > 0) {
                return {
                    status: 'warning',
                    message: `Missing languages in dictionary: ${missing.join(', ')}`
                };
            }

            return { status: 'ok', message: 'Localization configured for fa, en, es' };
        } catch (e) {
            return { status: 'error', message: e.message };
        }
    }
};

// ============ MAIN FUNCTIONS ============

async function runAudit() {
    log('🔧 Chef Technician - Technical Audit', 'blue');
    log('='.repeat(50), 'blue');

    const results = [];

    for (const [name, checkFn] of Object.entries(checks)) {
        const result = await checkFn();
        results.push({ name, ...result });

        const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
        const color = result.status === 'ok' ? 'green' : result.status === 'warning' ? 'yellow' : 'red';
        log(`${icon} ${result.message}`, color);
        if (result.fix) {
            log(`   💡 Fix: ${result.fix}`, 'cyan');
        }
    }

    // Generate report
    generateReport(results);

    const errors = results.filter(r => r.status === 'error').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    log('\n' + '='.repeat(50), 'blue');
    log(`📊 Summary: ${errors} errors, ${warnings} warnings`, errors > 0 ? 'red' : warnings > 0 ? 'yellow' : 'green');
    log(`📄 Report saved to: technical_report.md`, 'cyan');

    return { errors, warnings, results };
}

function generateReport(results) {
    const date = new Date().toISOString();
    let report = `# Technical Health Report\n\n`;
    report += `**Generated:** ${date}\n\n`;
    report += `## Summary\n\n`;

    const errors = results.filter(r => r.status === 'error');
    const warnings = results.filter(r => r.status === 'warning');
    const passed = results.filter(r => r.status === 'ok');

    report += `- ✅ Passed: ${passed.length}\n`;
    report += `- ⚠️ Warnings: ${warnings.length}\n`;
    report += `- ❌ Errors: ${errors.length}\n\n`;

    if (errors.length > 0) {
        report += `## ❌ Errors (Must Fix)\n\n`;
        for (const e of errors) {
            report += `### ${e.name}\n`;
            report += `- **Issue:** ${e.message}\n`;
            if (e.fix) report += `- **Fix:** ${e.fix}\n`;
            report += `\n`;
        }
    }

    if (warnings.length > 0) {
        report += `## ⚠️ Warnings\n\n`;
        for (const w of warnings) {
            report += `### ${w.name}\n`;
            report += `- **Issue:** ${w.message}\n`;
            if (w.fix) report += `- **Fix:** ${w.fix}\n`;
            report += `\n`;
        }
    }

    report += `## ✅ Passed Checks\n\n`;
    for (const p of passed) {
        report += `- **${p.name}:** ${p.message}\n`;
    }

    fs.writeFileSync(REPORT_PATH, report);
}

// ============ CLI ============

const command = process.argv[2] || 'audit';

switch (command) {
    case 'audit':
        runAudit();
        break;
    case 'fix':
        log('🔧 Auto-fix mode not yet implemented', 'yellow');
        log('Run "audit" first to see issues', 'cyan');
        break;
    case 'watch':
        log('👁️  Watch mode - running audit every 5 minutes', 'blue');
        runAudit();
        setInterval(runAudit, 5 * 60 * 1000);
        break;
    default:
        log('Usage: node scripts/chef_technician.js [audit|fix|watch]', 'yellow');
}

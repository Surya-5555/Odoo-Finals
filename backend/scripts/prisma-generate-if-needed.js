const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

function fileMtimeMs(filePath) {
	try {
		return fs.statSync(filePath).mtimeMs;
	} catch {
		return null;
	}
}

function maxMtimeMsInDir(dirPath) {
	let max = null;
	try {
		const entries = fs.readdirSync(dirPath, { withFileTypes: true });
		for (const entry of entries) {
			const fullPath = path.join(dirPath, entry.name);
			if (entry.isDirectory()) {
				const sub = maxMtimeMsInDir(fullPath);
				if (sub != null) max = max == null ? sub : Math.max(max, sub);
				continue;
			}
			if (entry.isFile()) {
				const mt = fileMtimeMs(fullPath);
				if (mt != null) max = max == null ? mt : Math.max(max, mt);
			}
		}
	} catch {
		return null;
	}
	return max;
}

function run(cmd, args, opts) {
	return new Promise((resolve) => {
		const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
		p.on('exit', (code) => resolve(code ?? 1));
	});
}

async function main() {
	const force = ['1', 'true', 'yes'].includes(
		String(process.env.FORCE_PRISMA_GENERATE ?? '').toLowerCase(),
	);

	const cwd = process.cwd();
	const schemaPath = path.join(cwd, 'prisma', 'schema.prisma');
	const migrationsDir = path.join(cwd, 'prisma', 'migrations');

	const clientIndex = path.join(cwd, 'node_modules', '.prisma', 'client', 'index.js');
	const queryEngineWin = path.join(
		cwd,
		'node_modules',
		'.prisma',
		'client',
		'query_engine-windows.dll.node',
	);

	const schemaMtime = fileMtimeMs(schemaPath);
	const migrationsMtime = maxMtimeMsInDir(migrationsDir);
	const inputMtimes = [schemaMtime, migrationsMtime].filter((v) => v != null);
	const inputLastModified = inputMtimes.length ? Math.max(...inputMtimes) : null;

	const clientMtime = fileMtimeMs(clientIndex);
	const engineMtime = fileMtimeMs(queryEngineWin);
	const outputMtimes = [clientMtime, engineMtime].filter((v) => v != null);
	const outputsExist = clientMtime != null;
	const outputLastModified = outputMtimes.length ? Math.min(...outputMtimes) : null;

	const upToDate =
		!force &&
		outputsExist &&
		inputLastModified != null &&
		outputLastModified != null &&
		outputLastModified >= inputLastModified;

	if (upToDate) {
		console.log('Prisma client appears up-to-date; skipping prisma generate for dev startup.');
		process.exit(0);
	}

	if (force) {
		console.log('FORCE_PRISMA_GENERATE is set; running prisma generate...');
	} else if (!outputsExist) {
		console.log('Prisma client not found; running prisma generate...');
	} else {
		console.log('Prisma schema/migrations changed; running prisma generate...');
	}

	const code = await run('node', [path.join('scripts', 'prisma-generate-retry.js')], {
		env: process.env,
	});
	process.exit(code);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});

const { spawn } = require('node:child_process');

function run(cmd, args, opts) {
	return new Promise((resolve) => {
		const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
		p.on('exit', (code) => resolve(code ?? 1));
	});
}

function sleep(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

async function main() {
	const maxAttempts = Number(process.env.PRISMA_GENERATE_RETRIES ?? 6);
	let attempt = 0;
	while (attempt < maxAttempts) {
		attempt += 1;
		const code = await run('npx', ['prisma', 'generate'], { env: process.env });
		if (code === 0) process.exit(0);

		// On Windows, Prisma can fail to rename the query engine DLL if it is temporarily locked.
		const backoffMs = Math.min(1500 * attempt, 8000);
		console.warn(
			`Prisma generate failed (attempt ${attempt}/${maxAttempts}). Retrying in ${backoffMs}ms...`,
		);
		await sleep(backoffMs);
	}

	process.exit(1);
}

main().catch(() => process.exit(1));

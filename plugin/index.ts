import { plugin } from "bun";
import { dlopen, suffix, type FFIFunction } from "bun:ffi";
import { readFileSync } from "fs";
import { getExported } from "./parser.ts";
import { getTypeFromV } from "./typesParser.ts";
import { generateDeclarations } from "./typeInferrer.ts";

plugin({
    name: "V Loader",
    setup(build) {
        build.onLoad({ filter: /\.v$/ }, (args) => {
            let result;
            try {
                result = Bun.spawnSync({
                    cmd: ['v', '-shared', args.path, '-o', `${args.path}.${suffix}`],
                });
            } catch (e) {
                const rawError = e instanceof Error ? e.message : String(e);
                if (/ENOENT|not found/i.test(rawError)) {
                    throw new Error(`Failed to compile ${args.path}: the V compiler ('v') was not found.\nPlease make sure the V compiler is installed and its directory is added to PATH.\n${rawError}`);
                }
                throw new Error(`Failed to compile ${args.path}: ${rawError}`);
            }

            if (!result.success) {
                throw new Error(`Failed to compile ${args.path}\n${result.stderr.toString()}\nFix the V code and rebuild.`);
            }

            const content = readFileSync(args.path, "utf-8");

            const exported = getExported(content);

            const symbols: Record<string, FFIFunction> = {}
            exported.forEach(({ name, args, returned }) => {
                symbols[name] = {
                    args: args.map(arg => getTypeFromV(arg[1])),
                    returns: getTypeFromV(returned),
                };
            });

            const dl = dlopen(`${args.path}.${suffix}`, symbols);

            generateDeclarations(args.path, Object.keys(symbols));

            return {
                loader: "object",
                exports: dl.symbols,
            };
        });
    },
});


/*
V types:

    bool

    string

    i8    i16  int  i64      i128 (soon)
    u8    u16  u32  u64      u128 (soon)

    rune // represents a Unicode code point

    f32 f64

    isize, usize // platform-dependent, the size is how many bytes it takes to reference any location in memory

    voidptr // this one is mostly used for [C interoperability](#v-and-c)

    any // similar to C's void* and Go's interface{}

Note: V `string` is intentionally NOT supported here. It is a 16-byte struct
`{&u8 str; int len; int is_lit}` (on x64), so mapping it to `FFIType.cstring`
(char*) makes Bun dereference the struct bytes as a C string, which crashes at
runtime on Windows x64. Export functions must return `&char` (use `.str`) or
`voidptr` instead. See PR #1 issue 3.
*/

import { FFIType } from "bun:ffi";

export function getTypeFromV(type: string) {
    switch (type) {
        case "bool":
            return FFIType.bool;
        case "string":
            // V `string` is a 16-byte struct {&u8 str; int len; int is_lit} (x64).
            // Mapping it to cstring makes FFI dereference the struct bytes as a
            // C string, causing a segmentation fault at runtime on Windows x64.
            // Export functions must return &char (s.str) or voidptr instead.
            throw new Error("V 'string' is a 16-byte struct and cannot be safely mapped to FFIType.cstring on Windows x64; change the V function to return &char (s.str) or voidptr instead");
        case "&char":
            return FFIType.cstring;
        case "i8":
            return FFIType.int8_t;
        case "i16":
            return FFIType.int16_t;
        case "int":
            return FFIType.int;
        case "i64":
            return FFIType.int64_t;
        case "i128":
            throw new Error("i128 is not supported");
        case "u8":
            return FFIType.uint8_t;
        case "u16":
            return FFIType.uint16_t;
        case "u32":
            return FFIType.uint32_t;
        case "u64":
            return FFIType.uint64_t;
        case "u128":
            throw new Error("u128 is not supported");
        case "rune":
            return FFIType.u32;
        case "f32":
            return FFIType.float;
        case "f64":
            return FFIType.double;
        case "isize":
            throw new Error("isize is not supported");
        case "usize":
            throw new Error("usize is not supported");
        case "voidptr":
            return FFIType.ptr;
        case "any":
            throw new Error("any is not supported");
        case "void":
            return FFIType.void;
        default:
            throw new Error(`Unknown type ${type}`);
    }
}
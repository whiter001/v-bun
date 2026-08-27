module example

@[export: 'teapot']
fn teapot(code int) {
	println("${code} - I'm a teapot.")
}

@[export: 'add']
fn add(a int, b int) int {
	return a + b
}

@[export: 'sub']
fn sub(a int, b int) int {
	return a - b
}

@[export: 'hello']
fn hello() &char {
	// Note: returning &char via `s.str` is only safe because `s` is a string
	// literal stored in static memory by the V compiler, so its lifetime spans
	// the whole program. Do NOT return `.str` of a dynamically built string
	// (e.g. from concatenation/interpolation like "Hello " + name): that data
	// is heap-allocated and becomes a dangling pointer after the function
	// returns, causing undefined behavior or a crash on the caller side.
	s := "Hello from V!"
	return s.str
}

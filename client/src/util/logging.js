export function log(type, typestyle, scope, ...args) {
  console.log(
    "%c%s %c[%s]",
    typestyle,
    type,
    "color: #35d614; font-weight: bold;",
    scope,
    ...args
  );
}

export function debug(scope, ...args) {
  console.debug(
    "%cdebug %c[%s]",
    "color: gray;",
    "color: #35d614; font-weight: bold",
    scope,
    ...args
  );
}

export function info(scope, ...args) {
  log("info", "color: blue-bright; font-weight: bold", scope, ...args);
}

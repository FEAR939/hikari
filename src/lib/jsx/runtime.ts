// jsx-runtime.ts
type Props = Record<string, any> & { children?: any };

const SVG_TAGS = new Set([
  "svg",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "g",
  "text",
  "tspan",
  "defs",
  "use",
  "clipPath",
  "linearGradient",
  "radialGradient",
  "stop",
  "mask",
  "pattern",
]);

export function h(
  tag: string | Function,
  props: Props | null,
  ...children: any[]
): HTMLElement | SVGElement | DocumentFragment {
  if (typeof tag === "function") {
    return tag({ ...props, children });
  }

  // Create SVG element if it's an SVG tag
  const element = SVG_TAGS.has(tag)
    ? document.createElementNS("http://www.w3.org/2000/svg", tag)
    : document.createElement(tag);

  // Set props
  if (props) {
    Object.entries(props).forEach(([key, value]) => {
      if (key.startsWith("on") && typeof value === "function") {
        // Event listeners
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else if (key === "className" || key === "class") {
        element.setAttribute("class", value);
      } else if (key === "style" && typeof value === "object") {
        Object.assign((element as HTMLElement).style, value);
      } else if (key !== "children") {
        // Use setAttribute for SVG attributes
        element.setAttribute(key, value);
      }

      if (key === "ref" && typeof value === "function") {
        value(element);
      } else if (key === "ref") {
        value = element;
      }
    });
  }

  // Append children
  children.flat(Infinity).forEach((child) => {
    if (child == null || child === false) return;
    element.appendChild(
      child instanceof Node ? child : document.createTextNode(String(child)),
    );
  });

  return element;
}

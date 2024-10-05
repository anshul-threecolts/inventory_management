import { useEffect, useRef } from "react";

function useClickOutside(handler: any, element: any) {
  let domNode = useRef(element);
  useEffect(() => {
    let maybeHandler = (event: any) => {
      if (
        domNode &&
        domNode.current &&
        !isChild(domNode.current, event.target)
      ) {
        handler(domNode.current.id);
      }
    };

    document.addEventListener("mousedown", maybeHandler);

    return () => {
      document.removeEventListener("mousedown", maybeHandler);
    };
  });

  return domNode;
}

function isChild(parent: any, child: any) {
  var node = child.parentNode;
  while (node != null) {
    if (parent.id && node.id == parent.id) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}

export default useClickOutside;

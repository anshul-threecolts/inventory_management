import React from "react";
import PropTypes from "prop-types";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface PropData {
  st: any;
  message: any;
  position: any;
  id: string;
}

export const TooltipCustom = (props: PropData) => {
  const tool = <Tooltip id={props.id} style={{ position: "fixed" }}>
    {props.message}
  </Tooltip>
  return (
    <OverlayTrigger placement={props.position} overlay={tool}>
      {props.st}
    </OverlayTrigger>
  );
};

import React, { useState } from "react";
import "./Password.css";
import { Button, Col, FloatingLabel, Form, InputGroup, Row } from "react-bootstrap";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { Label } from "../Label/Label";

interface PropData {
    // value: any;
    // show: boolean;
    // type: string;
    id?: string;
    name?: string;
    placeholder: string;
    label: string;
    inputGroupClassName?: string;
    inputFieldClassName?: string;
    method?: any;
    requiredMsg?: any;
    key?: any;
    onError?: any;
}

const Password = (props: PropData) => {
    const [passwordType, setPasswordType] = useState("password");
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordVisibility, setPasswordVisibility] = useState(false);

    const handlePasswordVisibility = () => {
        if (passwordVisibility) {
            setPasswordVisibility(false);
            setPasswordType("password")
        } else {
            setPasswordVisibility(true);
            setPasswordType("text")
        }
    };
    return (
        <>
            <InputGroup className={props.inputGroupClassName}>
                <FloatingLabel label={props.label}>
                    <Form.Control
                        id={props.id}
                        className={props.inputFieldClassName}
                        name={props.name}
                        placeholder={props.placeholder}
                        {...props.requiredMsg}
                        type={passwordType}
                        onChange={props.method}
                    />
                </FloatingLabel>
                <Button variant="outline-secondary" id="button-addon2" onClick={() => handlePasswordVisibility()}>
                    {
                        passwordVisibility ? <AiFillEyeInvisible /> : <AiFillEye />
                    }
                </Button>
            </InputGroup>
            {
                props.onError ? props.onError : ""
            }
        </>
    )

}

export default Password;
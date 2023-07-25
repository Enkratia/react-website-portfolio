import React from "react";

import { useValidateForm } from "../../util/customHooks/useValidateForm";

import s from "./ModalLogin.module.scss";
import cs from "../../scss/global/_index.module.scss";

import { Check, Cross, Facebook, Google, Linkedin, Twitter } from "../../iconComponents";

type ModalLoginProps = {
  onModalLoginClick: () => void;
  onModalSwapClick: () => void;
};

export const ModalLogin: React.FC<ModalLoginProps> = ({ onModalLoginClick, onModalSwapClick }) => {
  const [isChecked, setIsChecked] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);

  const contentRef = React.useRef<HTMLDivElement>(null);

  const { isValidEmail, validateEmail, isValidPassLength, validatePassLength } = useValidateForm();

  const onModalOutsideClick = (e: React.MouseEvent<HTMLFormElement>) => {
    if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      onModalLoginClick();
    }
  };

  return (
    <form className={s.root} onClick={onModalOutsideClick}>
      <div className={s.wrapper}>
        <div ref={contentRef} className={s.content}>
          {/* <!-- Top --> */}
          <div className={s.top}>
            {/* <!-- Title --> */}
            <h3 className={s.title}>Sign in</h3>

            {/* <!-- Subtitle --> */}
            <p className={s.subtitle}>
              Sign in to your account using email and password provided during registration.
            </p>

            {/* <!-- Field1 --> */}
            <div className={s.field}>
              <label htmlFor="log-in-email" className={s.label}>
                Email
              </label>

              <div className={`${cs.inputWrapper} ${cs[isValidEmail]}`} data-validity="email">
                <input
                  type="email"
                  className={`${s.input} ${cs.input}`}
                  id="log-in-email"
                  name="log-in-email"
                  placeholder="Your working email"
                  onChange={validateEmail}
                />
              </div>
            </div>

            {/* <!-- Field2 --> */}
            <div className={s.field}>
              <label htmlFor="log-in-password" className={s.label}>
                Password
              </label>

              <div
                className={`${cs.inputWrapper} ${cs[isValidPassLength]}`}
                data-validity="pass-length">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${s.input} ${cs.input} ${cs.inputPassword}`}
                  id="log-in-password"
                  name="log-in-password"
                  placeholder="&#183;&#183;&#183;&#183;&#183;&#183;&#183;&#183;&#183;&#183;&#183;&#183;&#183;"
                  onChange={validatePassLength}
                />

                <button
                  type="button"
                  className={`${s.show} ${showPassword ? s.show : s.showActive}`}
                  aria-label="Show entered password."
                  onClick={() => setShowPassword((s) => !s)}></button>
              </div>
            </div>

            {/* <!-- Remembering --> */}
            <div className={s.remembering}>
              <div className={s.rememberingKeep}>
                <div
                  onClick={() => setIsChecked((n) => !n)}
                  style={{ marginRight: "12px" }}
                  className={`${cs.customCheckbox} ${isChecked ? cs.customCheckboxChecked : ""}`}
                  tabIndex={0}
                  role="checkbox"
                  aria-checked={isChecked ? "true" : "false"}>
                  <Check aria-hidden="true" />

                  <input type="hidden" name="log-in-checkbox" defaultValue="0" />
                  <input
                    id="log-in-checkbox"
                    type="checkbox"
                    name="log-in-checkbox"
                    defaultValue="1"
                    checked={isChecked}
                    readOnly
                    hidden
                  />
                </div>

                <label htmlFor="log-in-checkbox" className={s.rememberingChecktext}>
                  Keep me signed in
                </label>
              </div>

              <button className={s.rememberingForgot}>Forgot password?</button>
            </div>

            {/* <!-- Sign in button --> */}
            <button className={`${s.button} ${cs.btn} ${cs.btnMid}`}>Sign in</button>

            {/* <!-- Switcher --> */}
            <div className={s.switcher}>
              <span className={s.switcherDescr}>Don't have an account?</span>
              <button onClick={onModalSwapClick} className={s.switcherLink}>
                Sign up
              </button>
            </div>
          </div>

          {/* <!-- Divider --> */}
          <p className={s.divider}>Or sign in with</p>

          {/* <!-- Bottom --> */}
          <div className={s.bottom}>
            <ul className={`${s.social} ${cs.social} ${cs.ulReset}`}>
              <li className={cs.socialItem}>
                <a
                  href="#"
                  target="_blank"
                  className={`${cs.socialLink} ${cs.socialLinkLight}`}
                  aria-label="Sign in with facebook.">
                  <Facebook aria-hidden="true" />
                </a>
              </li>

              <li className={cs.socialItem}>
                <a
                  href="#"
                  target="_blank"
                  className={`${cs.socialLink} ${cs.socialLinkLight}`}
                  aria-label="Sign in with google.">
                  <Google aria-hidden="true" />
                </a>
              </li>

              <li className={cs.socialItem}>
                <a
                  href="#"
                  target="_blank"
                  className={`${cs.socialLink} ${cs.socialLinkLight}`}
                  aria-label="Sign in with twitter.">
                  <Twitter aria-hidden="true" />
                </a>
              </li>

              <li className={cs.socialItem}>
                <a
                  href="#"
                  target="_blank"
                  className={`${cs.socialLink} ${cs.socialLinkLight}`}
                  aria-label="Sign in with linkedIn.">
                  <Linkedin aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* <!-- Close --> */}
          <button
            onClick={() => {
              onModalLoginClick();
            }}
            type="button"
            className={s.close}
            aria-label="Close this modal window.">
            <Cross />
          </button>
        </div>
      </div>
    </form>
  );
};

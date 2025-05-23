import React from "react";

const UpperPanel = function (props: {onClickBack?: () => void; name: string}) {
    return (
      <>
        <div className={props.onClickBack != undefined ? "profile-welcome" : "profile-welcome-no-btn"}>
          {props.onClickBack != undefined ? (
            <button className="btn-service" onClick={() => props.onClickBack != undefined ? props.onClickBack() : null}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                className="bi bi-arrow-left"
                viewBox="0 0 16 16"
              >
                <path
                  d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8"
                  fillRule="evenodd"
                ></path>
              </svg>
            </button>
          ) : null}
          <h2 className="my-2 ms-2">{props.name}</h2>
        </div>

        <hr className="my-4" />
      </>
    );
};

export default UpperPanel;
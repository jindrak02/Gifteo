import { NavLink } from "react-router-dom";
import { useInvitations } from "../../store/InvitationContext";
import { useMediaQuery } from 'react-responsive';
import Swal from "sweetalert2";
import {fetchWithAuth} from "../../utils/fetchWithAuth";

const NavPanel = function () {
  const { invitations } = useInvitations();
  const hasInvitations = invitations.length > 0;
  const isDesktop = useMediaQuery({ minWidth: 1200 });

    // Odhlášení uživatele
    const handleLogOut = async function () {
      const result = await Swal.fire({
        title: "Log Out?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#8F84F2",
        confirmButtonText: "Yes, Log Out",
      });
  
      if (result.isConfirmed) {
        const res = await fetchWithAuth("auth/logout", {
          method: "POST",
          credentials: "include", // Posílání cookies
        });
  
        const data = await res.json();
        if (data.success) {
          console.log("Logout Successful.");
          window.location.reload(); // Obnovit aplikaci pro načtení session
        }
      }
    };

  return (
    <>
      <nav className="navbar navbar-expand fixed-bottom" id="navbar-panel">
        <div className="container-fluid" id="nav-panel">
          {
            /*#region Desktop menu vs mobile*/
            isDesktop ? (
              <>
                <div className="flex desktop-nav-links">
                  <img className="profile-picture-thumbnail-sm" src="/images/icon.png" alt="Gifteo logo" />
                  
                  <NavLink
                    to="/calendar"
                    className={({ isActive }) =>
                      isActive ? "active-link nav-link" : "nav-link"
                    }
                  >
                    <button
                      type="button"
                      className="btn nav-btn-custom btn-tooltip"
                      id="calendarButton"
                      data-tooltip="My Calendar"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="currentColor"
                        className="bi bi-calendar-event"
                        viewBox="0 0 16 16"
                      >
                        <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                      </svg>
                      <p className="desktop-menu-title">My Calendar</p>
                    </button>
                  </NavLink>

                  <NavLink
                    to="/ideas"
                    className={({ isActive }) =>
                      isActive ? "active-link nav-link" : "nav-link"
                    }
                  >
                    <button
                      type="button"
                      className="btn nav-btn-custom btn-tooltip"
                      id="ideasButton"
                      data-tooltip="My-Ideas"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="currentColor"
                        className="bi bi-lightbulb"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1" />
                      </svg>
                      <p className="desktop-menu-title">My Ideas</p>
                    </button>
                  </NavLink>

                  <NavLink
                    to="/hub"
                    className={({ isActive }) =>
                      isActive ? "active-link nav-link" : "nav-link"
                    }
                  >
                    <button
                      type="button"
                      className="btn nav-btn-custom btn-tooltip"
                      id="hubButton"
                      data-tooltip="Wishlist Hub"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="currentColor"
                        className="bi bi-card-checklist"
                        viewBox="0 0 16 16"
                      >
                        <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
                        <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0M7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0" />
                      </svg>
                      <p className="desktop-menu-title">Gift for</p>
                    </button>
                  </NavLink>

                  <NavLink
                    to="/people"
                    className={({ isActive }) =>
                      isActive ? "active-link nav-link" : "nav-link"
                    }
                  >
                    <div className="notification-container">
                      <button
                        type="button"
                        className="btn nav-btn-custom btn-tooltip"
                        id="peopleButton"
                        data-tooltip="My People"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="30"
                          height="30"
                          fill="currentColor"
                          className="bi bi-people"
                          viewBox="0 0 16 16"
                        >
                          <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                        </svg>
                        <p className="desktop-menu-title">My People</p>
                      </button>
                      {hasInvitations && (
                        <div className="new-invitation-icon"></div>
                      )}
                    </div>
                  </NavLink>

                  <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                      isActive ? "active-link nav-link" : "nav-link"
                    }
                  >
                    <button
                      type="button"
                      className="btn nav-btn-custom btn-tooltip"
                      id="profileButton"
                      data-tooltip="My Profile"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="currentColor"
                        className="bi bi-person"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                      </svg>
                      <p className="desktop-menu-title">My Profile</p>
                    </button>
                  </NavLink>
                </div>

                <div className="flex desktop-nav-services" onClick={handleLogOut}>
                  <button className="btn nav-btn-custom btn-tooltip">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      fill="currentColor"
                      className="bi bi-box-arrow-right"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
                      ></path>
                      <path
                        fillRule="evenodd"
                        d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
                      ></path>
                    </svg>
                    <p className="desktop-menu-title">Log Out</p>
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink
                  to="/calendar"
                  className={({ isActive }) =>
                    isActive ? "active-link nav-link" : "nav-link"
                  }
                >
                  <button
                    type="button"
                    className="btn nav-btn-custom btn-tooltip"
                    id="calendarButton"
                    data-tooltip="My Calendar"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      fill="currentColor"
                      className="bi bi-calendar-event"
                      viewBox="0 0 16 16"
                    >
                      <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
                      <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                    </svg>
                    <p className="desktop-menu-title">My Calendar</p>
                  </button>
                </NavLink>

                <NavLink
                  to="/ideas"
                  className={({ isActive }) =>
                    isActive ? "active-link nav-link" : "nav-link"
                  }
                >
                  <button
                    type="button"
                    className="btn nav-btn-custom btn-tooltip"
                    id="ideasButton"
                    data-tooltip="My-Ideas"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      fill="currentColor"
                      className="bi bi-lightbulb"
                      viewBox="0 0 16 16"
                    >
                      <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a2 2 0 0 0-.453-.618A5.98 5.98 0 0 1 2 6m6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1" />
                    </svg>
                    <p className="desktop-menu-title">My Ideas</p>
                  </button>
                </NavLink>

                <NavLink
                  to="/hub"
                  className={({ isActive }) =>
                    isActive ? "active-link nav-link" : "nav-link"
                  }
                >
                  <button
                    type="button"
                    className="btn nav-btn-custom btn-tooltip"
                    id="hubButton"
                    data-tooltip="Wishlist Hub"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      fill="currentColor"
                      className="bi bi-card-checklist"
                      viewBox="0 0 16 16"
                    >
                      <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z" />
                      <path d="M7 5.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 1 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0M7 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5m-1.496-.854a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0l-.5-.5a.5.5 0 0 1 .708-.708l.146.147 1.146-1.147a.5.5 0 0 1 .708 0" />
                    </svg>
                    <p className="desktop-menu-title">Gift for</p>
                  </button>
                </NavLink>

                <NavLink
                  to="/people"
                  className={({ isActive }) =>
                    isActive ? "active-link nav-link" : "nav-link"
                  }
                >
                  <div className="notification-container">
                    <button
                      type="button"
                      className="btn nav-btn-custom btn-tooltip"
                      id="peopleButton"
                      data-tooltip="My People"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        fill="currentColor"
                        className="bi bi-people"
                        viewBox="0 0 16 16"
                      >
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                      </svg>
                      <p className="desktop-menu-title">My People</p>
                    </button>
                    {hasInvitations && (
                      <div className="new-invitation-icon"></div>
                    )}
                  </div>
                </NavLink>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    isActive ? "active-link nav-link" : "nav-link"
                  }
                >
                  <button
                    type="button"
                    className="btn nav-btn-custom btn-tooltip"
                    id="profileButton"
                    data-tooltip="My Profile"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30"
                      fill="currentColor"
                      className="bi bi-person"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                    </svg>
                    <p className="desktop-menu-title">My Profile</p>
                  </button>
                </NavLink>
              </>
            )
            /*#endregion Desktop menu vs mobile */
          }
        </div>
      </nav>
    </>
  );
};

export default NavPanel;

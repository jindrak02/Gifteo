import React, {useState} from "react";
import UserSearch from "./UserSearch";
import { useTranslation } from "react-i18next";

const AddPerson = () => {
    const { t } = useTranslation();
    const [addingExistngUser, setAddingExistingUser] = useState<boolean>(false);
    const [addingNewUser, setAddingNewUser] = useState<boolean>(false);

    const handleAddExistingUser = () => {
        console.log('TODO: Adding existing user');
        setAddingExistingUser(true);
        setAddingNewUser(false);
    };

    const handleAddNewUser = () => {
        //console.log('Adding new user');
        setAddingNewUser(true);
        setAddingExistingUser(false);
        // TODO: Add logic for adding a new user
    };

    if (addingExistngUser) {
        return <UserSearch />;
    }

    return (
        <>
            <div className="add-person-container my-4">
                <div className="person-option existing-user" onClick={handleAddExistingUser}>
                    <h2>{t("myPeople.addPerson.ExistingGifteoUser")}</h2>
                    <p>{t("myPeople.addPerson.ExistingGifteoUserDescription")}</p>
                </div>
                <div className="person-option new-user" onClick={handleAddNewUser}>
                    <h2>{t("myPeople.addPerson.NonGifteoUser")}</h2>
                    <p>{t("myPeople.addPerson.NonGifteoUserDescription")}</p>
                </div>
            </div>
      </>
    );
};

export default AddPerson;
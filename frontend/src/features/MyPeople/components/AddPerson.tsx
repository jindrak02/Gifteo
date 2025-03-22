import React, {useState} from "react";
import UserSearch from "./UserSearch";

const AddPerson = () => {
    const [addingExistngUser, setAddingExistingUser] = useState<boolean>(false);
    const [addingNewUser, setAddingNewUser] = useState<boolean>(false);

    const handleAddExistingUser = () => {
        console.log('Adding existing user');
        setAddingExistingUser(true);
        setAddingNewUser(false);
    };

    const handleAddNewUser = () => {
        console.log('Adding new user');
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
                        <h2>Existing Gifteo user</h2>
                        <p>
                            Find your friends or family members that use Gifteo and add them
                            to your dashboard
                        </p>
                </div>
                <div className="person-option new-user" onClick={handleAddNewUser}>
                        <h2>Person without Gifteo</h2>
                        <p>
                            Friends or family doesn’t use Gifteo? Don’t worry, you can still
                            create a profile for them
                        </p>
                </div>
            </div>
      </>
    );
};

export default AddPerson;
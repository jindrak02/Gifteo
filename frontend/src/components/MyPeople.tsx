import PersonThumbnail from "./PersonThumbnail";
import Swal from "sweetalert2";

const MyPeople = () => {

  const handleDetail = () => {
    console.log("Detail clicked");
  };

  const handleDelete = (personId: string) => {
    Swal.fire({
      title: "Are you sure?",
        text: "Do you realy want to remove this person from your persons?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#8F84F2",
        confirmButtonText: "Yes, remove",
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(personId + " Delete confirmed");
        Swal.fire("Deleted!", "Your person has been deleted.", "success");
      } else {
        console.log(personId + " Delete canceled");
        return;
      }
    });

  };

  return (
    <div className="profile-container p-4">
      <div className="profile-welcome">
        <h2 className="">My people</h2>
      </div>

      <hr className="my-4" />

      <PersonThumbnail
        key={"1"}
        imageUrl="https://d50-a.sdn.cz/d_50/c_img_QN_4/brds/chuck-norris.jpeg?fl=cro,0,93,1800,1012%7Cres,1200,,1%7Cjpg,80,,1"
        name="Kate Fikarova"
        wishlists={["Kacenka's b-day wishlist", "Valentines day wishlist", "Kacenka's b-day wishlist", "Valentines day wishlist", "Kacenka's b-day wishlist", "Valentines day wishlist"]}
        onDetail={handleDetail}
        onDelete={() => handleDelete("1")}
      />
      <PersonThumbnail
        key={"2"}
        imageUrl="https://d50-a.sdn.cz/d_50/c_img_QN_4/brds/chuck-norris.jpeg?fl=cro,0,93,1800,1012%7Cres,1200,,1%7Cjpg,80,,1"
        name="Will Smith"
        wishlists={["Kacenka's b-day wishlist", "Valentines day wishlist"]}
        onDetail={handleDetail}
        onDelete={() => handleDelete("2")}
      />
      <PersonThumbnail
        key={"3"}
        imageUrl="https://d50-a.sdn.cz/d_50/c_img_QN_4/brds/chuck-norris.jpeg?fl=cro,0,93,1800,1012%7Cres,1200,,1%7Cjpg,80,,1"
        name="Ryan Goss"
        wishlists={["Kacenka's b-day wishlist", "Valentines day wishlist"]}
        onDetail={handleDetail}
        onDelete={() => handleDelete("3")}
      />
      <PersonThumbnail
        key={"2"}
        imageUrl="https://d50-a.sdn.cz/d_50/c_img_QN_4/brds/chuck-norris.jpeg?fl=cro,0,93,1800,1012%7Cres,1200,,1%7Cjpg,80,,1"
        name="Will Smith"
        wishlists={["Kacenka's b-day wishlist", "Valentines day wishlist"]}
        onDetail={handleDetail}
        onDelete={() => handleDelete("2")}
      />
      <PersonThumbnail
        key={"3"}
        imageUrl="https://d50-a.sdn.cz/d_50/c_img_QN_4/brds/chuck-norris.jpeg?fl=cro,0,93,1800,1012%7Cres,1200,,1%7Cjpg,80,,1"
        name="Ryan Goss"
        wishlists={["Kacenka's b-day wishlist", "Valentines day wishlist"]}
        onDetail={handleDetail}
        onDelete={() => handleDelete("3")}
      />

      <div>
      <button className="add-person-btn btn-service">Add person</button>
      </div>
    </div>
  );
};

export default MyPeople;

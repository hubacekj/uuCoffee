import ListItems from './listItems.js'
import React, { useState, useMemo, useEffect } from 'react';
import { Outlet, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
import styles from './list.module.css';
import { mdiLoading } from "@mdi/js";

// import { useState } from 'react';
function ListGui(props) {
  let navigate = useNavigate();
  const [filter, setFilter] = useState({ plainTextFilter: "", ingredientId: -1 });
  const [ingredientCall, setIngredientCall] = useState({
    state: "pending"
  });

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/ingredients`, {
      method: "GET",
    }).then(async (response) => {
      const responseJson = await response.json();
      if (response.status >= 400) {
        setIngredientCall({ state: "error", error: responseJson });
      } else {
        setIngredientCall({ state: "success", data: responseJson });
      }
    })
  }, []); // an empty condition field means that the code will run only once

  const filteredStudentList = useMemo(() => {

    return props.recipies
      .filter((item) => {
        return (
          item.name
            .toLocaleLowerCase()
            .includes(filter.plainTextFilter.toLocaleLowerCase())
          &&
          (
            filter.ingredientId === -1 ||
            item.ingredients.map(ing => ing.ingredientId).includes(filter.ingredientId)
          )
        );
      })
      .sort((a,b) => (a.favorite == b.favorite) ? 0 : (a.favorite ? -1 : 1));
  }, [filter, props.recipies]);

  switch (ingredientCall.state) {
    case "pending":
      return (
        <div className={styles.loading}>
          <Icon size={2} path={mdiLoading} spin={true} />
        </div>
      );
    case "success":
      break;

    case "error":
      return (
        <div className={styles.error}>
          <div>Failed to load class data.</div>
          <br />
          <pre>{JSON.stringify(ingredientCall.error, null, 2)}</pre>
        </div>
      );
    default:
      return null;
  }

  const ingredientOptions = ingredientCall.data
    .map((data => (<option value={data.id}>{data.name}</option>)));


  // const [viewType, setViewType] = useState("grid");
  // const isGrid = viewType === "grid"; // isGrid je pomocná proměnná, kterou budeme dále používat pro řízení vzhledu

  function handleSearch(event) {
    event.preventDefault();
    setFilter({ plainTextFilter: event.target["searchInput"].value, ingredientId: parseInt(event.target["ingredientInput"].value) });
  }

  function handleSearchDelete(event) {
    if (!event.target.value) setFilter({ plainTextFilter: "", ingredientId: filter.ingredientId });
  }

  return <>
    <Form className="d-flex" onSubmit={handleSearch}>
      <Form.Control
        style={{ maxWidth: "400px" }}
        name="searchInput"
        type="Search"
        placeholder="Search"
        aria-label="Search"
        onChange={handleSearchDelete}
      />
      <Form.Select name="ingredientInput">
        <option value="-1">Přidat ingredienci</option>
        {ingredientOptions}
      </Form.Select>
      <Button style={{ marginRight: "8px" }} variant="outline-success" type="submit">
        <Icon size={1} path={mdiMagnify} />
      </Button>
      {/* <Button
        variant="outline-primary"
        onClick={() =>
          setViewType((currentState) => {
            if (currentState === "grid") return "table";
            else return "grid";
          })
        }
      >
        <Icon size={1} path={isGrid ? mdiTable : mdiViewGridOutline} />{" "}
        {isGrid ? "Tabulka" : "Grid"}
      </Button> */}
    </Form>
    <div className={styles.button}>
      <Button style={{ marginRight: "8px" }} variant="outline-success" onClick={() => navigate("/detail/new")}>
        Vytvořit recept
      </Button>
    </div>
    <ListItems recipeList={filteredStudentList} />
  </>;
}
export default ListGui
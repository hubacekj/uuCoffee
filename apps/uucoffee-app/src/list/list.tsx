import ListItems from './listItems.js'
import React, { useState, useMemo, useEffect } from 'react';
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Form from "react-bootstrap/Form";
import Icon from "@mdi/react";
import { mdiMagnify } from "@mdi/js";
import styles from './list.module.css';
import { mdiLoading } from "@mdi/js";
import ListGui from "./listGui.js";

function List() {
  const [listCall, setListCall] = useState({
    state: "pending",
  });
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/recipes`, {
      method: "GET",
    }).then(async (response) => {
      const responseJson = await response.json();
      if (response.status >= 400) {
        setListCall({ state: "error", error: responseJson });
      } else {
        setListCall({ state: "success", data: responseJson });
      }
    });
  }, []); // an empty condition field means that the code will run only once

  switch (listCall.state) {
    case "pending":
      return (
        <div className={styles.loading}>
          <Icon size={2} path={mdiLoading} spin={true} />
        </div>
      );
    case "success":
      return <ListGui recipies={listCall.data}/>;
      
    case "error":
      return (
        <div className={styles.error}>
          <div>Failed to load class data.</div>
          <br />
          <pre>{JSON.stringify(listCall.error, null, 2)}</pre>
        </div>
      );
    default:
      return null;
  }
}
export default List

import React, { useState, useMemo, useEffect } from 'react';
import Table from "react-bootstrap/Table";
import styles from './detail.module.css';
import { mdiLoading, mdiMinus, mdiPlus,  mdiPlaylistRemove } from "@mdi/js";
import Icon from "@mdi/react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { FormControl } from "react-bootstrap";

function IngredientList(props) {
  const [portionMultiplier, setPortionMultiplier] = useState(1);
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


  const deleteButton = index => (<Button
    style={{ padding: "4px", paddingTop: "1px" }}
    variant="outline-danger"
    onClick={() => props.deleteFunction(index)}><Icon size={1} path={mdiPlaylistRemove} /></Button>);

  const plusButton = (<Button
    style={{ padding: "4px", paddingTop: "1px" }}
    variant="outline-success"
    onClick={() => setPortionMultiplier(portionMultiplier + 1)}
    disabled={props.isUpdate}><Icon size={1} path={mdiPlus} /></Button>);
  const minusButton = (<Button
    style={{ padding: "4px", paddingTop: "1px" }}
    variant="outline-success"
    onClick={() => setPortionMultiplier(portionMultiplier - 1)}
    disabled={props.isUpdate || portionMultiplier <= 1}><Icon size={1} path={mdiMinus} /></Button>);
  let selectableData;
  let ingredientOptions;
  if (props.isUpdate) {
    const filter = props.ingredients.map((val) => val.ingredientId);
    selectableData = ingredientCall.data
      .filter((data) => !filter.includes(data.id));
    ingredientOptions = selectableData
      .map((data => (<option value={data.id}>{data.name}</option>)));
  }
  return (
    <>
      <div className={styles.controlledRow} >
        Počet porcí: {plusButton}<b>{portionMultiplier}</b>{minusButton}Objem porce: {props.isUpdate ? (<FormControl type="number" value={props.portionAmount} onChange={(event) => props.updatePortionAmount(parseInt(event.target.value) <= 1 ? 1 : parseInt(event.target.value))} />) : (props.portionAmount)} ml
      </div>
      <Table>
        <thead>
          <tr>
            <th>Název</th>
            <th>Množství</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {
            props.ingredients.map((ingredient, index) => {
              //format prep time
              const ingData = ingredientCall.data[ingredient.ingredientId - 1];
              const amount = (props.isUpdate ? <FormControl type="number" value={ingredient.amount} onChange={(event) => props.updateFunction(index, { amount: event.target.value <= 1 ? 1 : parseInt(event.target.value)})} /> : ingredient.amount * portionMultiplier);
              return (
                <tr key={ingredient.ingredientId}>
                  <td>{props.isUpdate ? <Form.Select as="elementType" onChange={(event) => props.updateFunction(index, { ingredientId: parseInt(event.target.value) })}>
                    <option value={ingredient.ingredientId}>{ingData.name}</option>
                    {ingredientOptions}
                  </Form.Select> : ingData.name}</td>
                  <td>{amount} {!props.isUpdate && ingData.unit}</td>
                  <td>{props.isUpdate && ingData.unit}</td>
                  <td>{props.isUpdate && deleteButton(index)}</td>
                </tr>
              );
            })}
          {props.isUpdate && (<tr key="add">
            <td><Form.Select as="elementType" value="-1" onChange={(event) => props.updateFunction(props.ingredients.length, { ingredientId: parseInt(event.target.value), amount: 1 })}>
                    <option value="-1">Přidat ingredienci</option>
                    {ingredientOptions}
                  </Form.Select></td>
            <td></td>
            <td></td>
          </tr>)}
        </tbody>
      </Table>
    </>);
}



export default IngredientList;
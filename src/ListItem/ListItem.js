import { Amplify } from "aws-amplify";
import React, { useState, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import {
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  View,
} from "@aws-amplify/ui-react";
import { listNotes } from "../graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "../graphql/mutations";
import awsExports from '../aws-exports';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from "aws-amplify/auth";


const client = generateClient();
Amplify.configure(awsExports);

export function ListItem() {

  const [notes, setNotes] = useState([]);

  async function fetchNotes() {
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note) => {
        if (note.image) {
          const url = await getUrl({key: note.id});
          note.image = url;
        } return note;
      })
    );
    setNotes(notesFromAPI);
  }

  async function createNote(event) {
    event.preventDefault();
    const user = await getCurrentUser();
    console.log(user);
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
      price: form.get("price"),
      owner: user.username
      
    };
    const result=await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    if (!!data.image) await uploadData({key:result.data.createNote.id, data:image}).result;
    fetchNotes();
    event.target.reset();
  } 

 
  
  return (
    <View className="App">
      <Heading level={2}>Sell an Item</Heading>
      
      
      <View as="form" margin="3rem 0" onSubmit={createNote}>
    	<Flex direction="row" justifyContent="center">
          <TextField
            name="name"
            placeholder="Item Name"
            label="Item Name"
            labelHidden
            variation="quiet"
            required
          />
          <TextField
            name="description"
            placeholder="Item Description"
            label="Item Description"
            labelHidden
            variation="quiet"
            required
          />

          <TextField
            name="price"
            placeholder="Item Price"
            label="Item Price"
            labelHidden
            variation="quiet"
            required
          />

          <View
            name="image"
            as="input"
            type="file"
            style={{ alignSelf: "end" }}
          />
          <Button type="submit" variation="primary">
            List Item
          </Button>
        </Flex>
      </View>

    </View>
  );
};


export default ListItem;


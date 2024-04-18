// From: https://aws.amazon.com/getting-started/hands-on/build-react-app-amplify-graphql/module-two/?e=gs2020&p=build-a-react-app
import React, { useState, useEffect } from "react";
import "./App.css";
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
  withAuthenticator,
} from "@aws-amplify/ui-react";
import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";
import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from "aws-amplify/auth";


Amplify.configure(awsExports);


const client = generateClient();

const App = ({ signOut }) => {

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function handleFetchUserAttributes() {
    try {
      const userAttributes = await getCurrentUser();
      console.log(userAttributes);
      return userAttributes.username;
    } catch (error) {
      console.log(error);
    }

  }



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
    const user = await handleFetchUserAttributes(); 
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
      price: form.get("price"),
      owner: user
      
    };
    const result=await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    if (!!data.image) await uploadData({key:result.data.createNote.id, data:image}).result;
    fetchNotes();
    event.target.reset();
  } 

  async function deleteNote({ id, name }) {
    const newNotes = notes.filter((note) => note.id !== id);
    setNotes(newNotes);
    await remove({key:id});
    await client.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  }

  return (
    <View className="App">

      <Heading level={1}>SCSU MARKETPLACE</Heading>
      <Button onClick={signOut}>Sign Out</Button>



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


      
      <Heading level={2}>Items for Sale</Heading>

      <View margin="3rem 0">
        {notes.map((note) => (
        <Flex
          key={note.id || note.name}
          direction="row"
          justifyContent="center"
          alignItems="center"
        >
    	  <Text as="strong" fontWeight={700}>
          {note.name}
        </Text>

        <Text as="strong">
          ${note.price}
        </Text>

        <Text as="strong">
          Seller: {note.owner}
        </Text>

        <Text as="span">{note.description}</Text>
          {note.image && (
          <Image
              src={note.image.url.href}
              alt={`visual aid for ${note.name}`}
              style={{ width: 400 }}
          />
        )}

          <Button variation="link" onClick={() => deleteNote(note)}>
            Delete Item
          </Button>
       
       
        </Flex>
      ))}
      </View> 
    </View>
  );
};

export default withAuthenticator(App);
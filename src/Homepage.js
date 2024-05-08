import React, { useState, useEffect } from "react";
import { Footer } from "./Login/Footer"; 
import { Header } from "./Login/Header";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import {
  Link,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  TextField,
  Tabs,
  View,
  withAuthenticator,
  Collection,
  TextAreaField
} from "@aws-amplify/ui-react";

import {
    BrowserRouter as Router,
    Link as ReactRouterLink,
    Routes,
    Route,
  } from 'react-router-dom';

import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";

import {Amplify} from 'aws-amplify';
import awsExports from './aws-exports'; 
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from "aws-amplify/auth";
import image_top from "./fit-3.png"; 

const client = generateClient();
Amplify.configure(awsExports);

export function Homepage({ signOut }) {

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);


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
      owner: user.username,
      
    };
    const result=await client.graphql({
      query: createNoteMutation,
      variables: { input: data },
    });
    if (!!data.image) await uploadData({key:result.data.createNote.id, data:image}).result;
    fetchNotes();
    alert("Item listed successfully!");
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

  const form_style = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    margin: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "2px 2px 6px 2px #ccc",
    width: "400px",
    maxWidth: "80%",
  };

  const text_field_style = {
    marginBottom: "20px",

  };

  const image_upload_style = {

    marginBottom: "20px",
    paddingLeft: "100px",  
  };  

  const button_style = {
    float: "right"

  };  

  const image_style = {

    width: "400px",
    heigh: "400px"
 
  };

  const buttonStyle = {
    width: "380px",
    height: "380px",
    margin: "20px",
    marginLeft:"20px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxShadow: "2px 2px 6px 2px #ccc",
    maxWidth:"400px"

   
  };

  const item_image_style = {
    width: "300px",
    height: "300px",
    borderRadius: "8px",
  };
  
  const button_content = {  
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "400px",

  };

const app_style = { 
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "5px"


    };

const tab_style = {
    width: "100%",

    };

  
  return (    

    <View style={app_style}>
      <Image
      alt="logo"
      src={image_top}
      style={image_style}

     />

    <Button onClick={signOut} variation="primary" style={button_style}>Sign Out </Button>

    <Tabs style={tab_style}
      defaultValue={'Buy'}
      items={[
        { label: 'Buy', value: 'Buy', content: 
              <Collection
                wrap="wrap" 
                direction=  "row"
                templateColumns="1fr 1fr 1fr"
                gap="10px"
                items={notes.map((note) => ({
                ...note,
                key: note.id,
                name: note.name,
                image: note.image,
                price: note.price,
                owner: note.owner
                }))}
                isSearchable
                isPaginated
                itemsPerPage={12}
                searchNoResultsFound={
                <Flex justifyContent="center">
                   <Text color="red.80" fontSize="1rem">
                      Nothing found, please try again
                  </Text>
                </Flex>}
        
                searchPlaceholder="Type to search..."
                searchFilter={(notes, keyword) =>
                notes.name.toLowerCase().startsWith(keyword.toLowerCase())
                }>

                {(note) => (
                
            <ReactRouterLink to={`/item/${note.id}`} component={Link}>
                    
             <Button grow="1" key={note.id} style={buttonStyle}>

                  <View style={button_content}>
                    {note.name} | ${note.price}    
                    <Image
                      src= {note.image.url.href }
                      alt={note.name}
                      style={item_image_style}
                     />
                  </View>
                  </Button>
                </ReactRouterLink>
           
                )}
              </Collection>,},

            
            
            { label: 'Sell', value: 'Sell', content:

            <View className="Sell">
            <Heading level={2}>Sell an Item</Heading>
            
            
            <View as="form" margin="3rem 0" onSubmit={createNote} style={form_style}>

            <Flex >
                <TextField
                  style={text_field_style}
                  name="name"
                  label="Item Name"
                  required
                />

            </Flex>

            <Flex>
                <TextField
                  style={text_field_style}
                  name="price"
                  label="Price $"
                  required
                />
            </Flex>

            <Flex>
                <TextAreaField
                  style={text_field_style}
                  name="description"
                  label="Item Description"
                  required
                />
            </Flex>

            Upload a Picture
            <Flex>
                <View
                  style={image_upload_style}
                  as="input"
                  name="image"
                  type="file"
                  label="Item Image"
                  required
                />
            </Flex>
            
            
            <Flex>
                <Button type="submit" variation="primary">
                  List Item
                </Button>
              </Flex>
            </View>
      
          </View>
          },
          
          { label: 'Your Items', value: 'Your Items', content:
        
              'your items'
        
        
        
          }
        ]}


              
    />
    </View>
  );
};

export default withAuthenticator(Homepage, {
  components: {
    Header,
    Footer
  }

});

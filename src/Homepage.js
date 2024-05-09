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
    Link as ReactRouterLink,
  } from 'react-router-dom';

import { listNotes } from "./graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
} from "./graphql/mutations";

import {Amplify} from 'aws-amplify';
import awsExports from './aws-exports'; 
import { generateClient, get } from 'aws-amplify/api';
import { getCurrentUser } from "aws-amplify/auth";
import image_top from "./fit-3.png"; 

const client = generateClient();
Amplify.configure(awsExports);

export function Homepage({ signOut }) {

  const [notes, setNotes] = useState([]);
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [currentUser, setCurrentUser] = useState(null); 
  const userNotes = notes.filter((note) => note.owner === currentUser?.username);

  useEffect(() => {
    fetchNotes();
  }, []);


  async function fetchNotes() {
    const apiData = await client.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    const currentUser = await getCurrentUser(); 
    setCurrentUser(currentUser);
    console.log("Current User: ", currentUser.username);
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
    const form = new FormData(event.target);
    const image = form.get("image");
    const data = {
      name: form.get("name"),
      description: form.get("description"),
      image: image.name,
      price: form.get("price"),
      owner: user.username,
      contact: form.get("contact")
      
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

const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);

    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
});

const sortedUserNotes = userNotes.sort((a, b) => {
  const dateA = new Date(a.createdAt);
  const dateB = new Date(b.createdAt);

  return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
});


const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
};

  const form_style = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    margin: "20px",
    border: "1px solid grey",
    borderRadius: "5px",
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
    width: "350px",

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

      <ReactRouterLink to="/"> 

      <Image
      alt="logo"
      src={image_top}
      style={image_style}

     />

      </ReactRouterLink>

    <Button onClick={signOut} variation="primary" style={button_style}>Sign Out </Button>

    <Tabs style={tab_style}
      defaultValue={'Buy'}
      items={[
        { label: 'Buy', value: 'Buy', content: 

        <View>
        <Flex justifyContent="space-between" alignItems="center" marginBottom="10px">
            <Button onClick={toggleSortOrder}>
                Sort by Date ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
            </Button>
        </Flex>


        <Collection
                wrap="wrap"
                direction="row"
                columns={3}
                gap="10px"
                items={sortedNotes.map((note) => ({
                    ...note,
                    key: note.id,
                }))}
                isSearchable
                isPaginated
                itemsPerPage={12}
                searchNoResultsFound={
                    <Flex justifyContent="center">
                        <Text color="red.80" fontSize="1rem">
                            Nothing found, please try again
                        </Text>
                    </Flex>
                }
                searchPlaceholder="Type to search..."
                searchFilter={(note, keyword) =>
                    note.name.toLowerCase().startsWith(keyword.toLowerCase())
                }
            >
                {(note) => (
                    <ReactRouterLink to={`/item/${note.id}`}>
                        <Button key={note.id} style={button_style}>
                            <View style={button_content}>
                                {note.name} | ${note.price}
                                <Image
                                    src={note.image?.url}
                                    alt={note.name}
                                    style={item_image_style}
                                />
                            </View>
                        </Button>
                    </ReactRouterLink>
                )}
            </Collection>
        </View>,},

            
            
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
                <TextField
                  style={text_field_style}
                  name="contact"
                  label="Contact Info"
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
        
          <View>
          <Flex justifyContent="space-between" alignItems="center" marginBottom="10px">
              <Button onClick={toggleSortOrder}>
                  Sort by Date ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
              </Button>
          </Flex>

          <Collection
              wrap="wrap"
              direction="row"
              columns={3}
              gap="10px"
              items={sortedUserNotes.map((note) => ({
                  ...note,
                  key: note.id,
              }))}
              isSearchable
              isPaginated
              itemsPerPage={12}
              searchNoResultsFound={
                  <Flex justifyContent="center">
                      <Text color="red.80" fontSize="1rem">
                          Nothing found, please try again
                      </Text>
                  </Flex>
              }
              searchPlaceholder="Type to search..."
              searchFilter={(note, keyword) =>
                  note.name.toLowerCase().startsWith(keyword.toLowerCase())
              }
          >
              {(note) => (
                 
                      <Button key={note.id} style={button_style}>
                          <View style={button_content}>
                              {note.name} | ${note.price}
                              <Image
                                  src={note.image?.url}
                                  alt={note.name}
                                  style={item_image_style}
                              />
                              <Button onClick={() => deleteNote(note)}>Delete</Button>
                          </View>
                      </Button>
          
              )}
          </Collection>
      </View>


    
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

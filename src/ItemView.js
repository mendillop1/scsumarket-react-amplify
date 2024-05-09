import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { getNote } from "./graphql/queries";
import { generateClient } from 'aws-amplify/api';
import { getUrl } from 'aws-amplify/storage';  // Assuming getUrl needs to be imported like this
import awsExports from './aws-exports';
import "./App.css";
import {
    Image,
    View,
    Flex,
    Text,
    Button
} from '@aws-amplify/ui-react';
import image_top from "./fit-3.png"; 

export const ItemView = (signOut) => {
    const client = generateClient();
    Amplify.configure(awsExports);
    
    const { id } = useParams();
    const [note, setNote] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const apiData = await client.graphql({
                    query: getNote,
                    variables: { id }
                });
                console.log("API Data:", apiData);
                if (apiData.data && apiData.data.getNote) {
                    const noteData = apiData.data.getNote;
                    const url = await getUrl({key: noteData.id});  
                    noteData.image = url; 

                    setNote(noteData);  
                  
                } else {
                    console.error("No note found for the provided ID:", id);
                }
            } catch (error) {
                console.error("Error fetching note:", error);
            }
        };

        if (id) {
            fetchNote();
        }
    }, [id]); 

    const image_style = { 
   
      width: "400px",
      height: "300px"
   
    };

    const button_style = {
      float: "right"
  
    };  

    const cardStyle = { 
      display: "flex",
      flexDirection: "column",
      borderRadius:"8px",
      marginTop: "20px",  
      width: "90%",
      padding: "20px",
      backgroundColor: "white",
      border: "1px solid #ccc",
      boxShadow: "2px 2px 6px 2px #ccc",
      

    };

    const app_style = { 
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "5px"
  
  
      };

    const item_image_style = {
      width: "300px",
      height: "300px"
      
    };
  
    

    return (
        <View style={app_style}>

        <Flex>
        <Image
          alt="logo"
          src={image_top}
          style={image_style}
        />
        </Flex>

        <Button onClick={signOut} variation="primary" style={button_style}>Sign Out </Button>
  

            <Flex style={cardStyle}>
                <Flex direction="row">
                    {note && <>
                        <Text>{note.name}</Text>|
                        {note.price && <Text>${note.price}</Text>}
    
                    </>}
                </Flex>

                <Flex style={item_image_style} direction="column">
                      {note && note.image && <Image src={note.image.url.href} style={item_image_style} alt="Note Image" /> } 
                </Flex>

                <Flex direction="row">
                      Date Posted:{note && note.createdAt && <Text>{new Date(note.createdAt).toLocaleDateString()}</Text>}
                </Flex>

                <Flex direction="row">
                      Seller:{note && note.owner && <Text>{note.owner}</Text>}
                </Flex>

                <Flex direction="row">
                      Contact:{note && note.contact && <Text>{note.contact}</Text>}
                </Flex>

                <Flex direction="column" >
                      <Text>Item Description:</Text>
                      {note && note.description}
                </Flex>
            </Flex>



        </View>
    );
};

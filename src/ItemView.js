import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { getNote } from "./graphql/queries";
import { generateClient } from 'aws-amplify/api';
import { getUrl } from 'aws-amplify/storage';  // Assuming getUrl needs to be imported like this
import awsExports from './aws-exports';
import {
    Card,
    Image,
    View,
    Heading,
    Flex,
    Badge,
    Text,
    Button,
    useTheme,
} from '@aws-amplify/ui-react';

export const ItemView = () => {
    const client = generateClient();
    Amplify.configure(awsExports);
    
    const { id } = useParams();
    const [note, setNote] = useState(null);
    const { tokens } = useTheme();

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
                    const url = await getUrl({key: noteData.id});  // Use noteData.id instead of note.id
                    noteData.image = url;  // Set the image URL in the note data

                    setNote(noteData);  // Now set the updated note data with the image URL
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
    }, [id]);  // useEffect depends on `id` to rerun when `id` changes

    return (
        <View backgroundColor={tokens.colors.background.secondary} padding={tokens.space.medium}>
            <Card>
                <Flex>
                    {note && <>
                        <Text>{note.name}</Text>
                        {note.price && <Badge>${note.price}</Badge>}
                        {note.owner && <Text>({note.owner})</Text>}
                        {note.createdAt && <Text>{new Date(note.createdAt).toLocaleDateString()}</Text>}
                        {note.image && <Image src={note.image.url.href} alt="Note Image" />}
                    </>}
                </Flex>
            </Card>
        </View>
    );
};

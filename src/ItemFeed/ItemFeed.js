import {
    Button,
    Flex,
    Image,
    Text,
    TextField,
    View,
    Collection
  } from "@aws-amplify/ui-react";

function ItemFeed({notes}) {
  return (
    <Collection
      type="grid"
      templateColumns="1fr 1fr 1fr"
      gap="15px"
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
      itemsPerPage={9}
      searchNoResultsFound={
        <Flex justifyContent="center">
          <Text color="red.80" fontSize="1rem">
            Nothing found, please try again
          </Text>
        </Flex>
      }
      searchPlaceholder="Type to search..."
      searchFilter={(notes, keyword) =>
        notes.name.toLowerCase().startsWith(keyword.toLowerCase())
      }
    >
      {(note) => (
        <Button grow="1" key={note.id}>
          {note.name} ${note.price} {note.owner} {note.description}
        </Button>
      )}
    </Collection>
  );
}

export default ItemFeed;

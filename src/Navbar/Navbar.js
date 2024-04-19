import { Tabs, View } from '@aws-amplify/ui-react';
import './Navbar.css';  
import ItemFeed from '../ItemFeed/ItemFeed';    
import ListItem from '../ListItem/ListItem';


export const Navbar = ({notes}) => (

<View className='Navbar'>

    <Tabs className='Tabs'
      defaultValue={'Buy'}
    items={[
      { label: 'Buy', value: 'Buy', content: <ItemFeed notes={notes}/>,},
      { label: 'Sell', value: 'Sell', content: <ListItem notes={notes}/>,},
    ]}
    />

  </View>
);
import React, { useState, useEffect } from "react";
import "./App.css";
import "@aws-amplify/ui-react/styles.css";
import {
  BrowserRouter as Router,
  Link as ReactRouterLink,
  Routes,
  Route,
} from 'react-router-dom';

import {
  Link,
  Flex,
  withAuthenticator,
} from "@aws-amplify/ui-react";

import {Amplify} from 'aws-amplify';
import awsExports from './aws-exports'; 
import { generateClient } from 'aws-amplify/api';
import { ItemView } from "./ItemView";
import { Homepage } from "./Homepage"


const client = generateClient();
Amplify.configure(awsExports);

export function App({ signOut }) {

return   (
  <Router>
    <Flex>
      <ReactRouterLink to="/" component={Link}>Home</ReactRouterLink>
      <ReactRouterLink to="/item/:id" component={Link}>ItemView</ReactRouterLink>
 
    </Flex>

    <Routes>
      <Route path="/" element={<Homepage signOut={signOut} />} />
      <Route path="/item/:id" element={<ItemView  />} />

    </Routes>
  </Router>
); 

}

export default withAuthenticator(App)


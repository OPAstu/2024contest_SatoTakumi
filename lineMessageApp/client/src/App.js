
/**import React from 'react';
import { Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

function App() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <HomeIcon style={{ fontSize: 100 }} />
    </Box>
  );
}

export default App;
*/

/**import React from 'react';
import { Box, IconButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

function App() {
  const handleClick = () => {
    window.location.href = 'https://opa.terakoya.tokyo.jp/';
  };
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <IconButton onClick={handleClick}>
        <HomeIcon style={{ fontSize: 100 }} />
      </IconButton>
    </Box>
  );
}

export default App;*/

import React, { useState } from 'react';
import { Container, TextField, Typography, Box } from '@mui/material';

function App() {
  const [inputText, setInputText] = useState('');
  const [displayText, setDisplayText] = useState('');

  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      setDisplayText(inputText);
      setInputText('');  // Optionally clear the input field after pressing Enter
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        React and MUI Input Display
      </Typography>
      <TextField
        label="Input Text"
        variant="outlined"
        fullWidth
        margin="normal"
        value={inputText}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <Box mt={2}>
        <Typography variant="h6" gutterBottom>
          You typed: {displayText}
        </Typography>
      </Box>
    </Container>
  );
}

export default App;



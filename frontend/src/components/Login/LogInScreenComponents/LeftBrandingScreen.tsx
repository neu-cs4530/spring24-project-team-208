import { Flex, VStack, HStack, Box, Image, Text } from '@chakra-ui/react';
import React from 'react';

/**
 * The left branding screen renders the left-hand side of the login screen.
 *
 * It uses Chakra-UI components (does not use other GUI widgets)
 *
 * It renders the following:
 * - The Covey.Town logo
 * - The Covey.Town name
 * - A tagline for Covey.Town
 */
export default function LeftBrandingScreen() {
  return (
    <>
      {' '}
      <Box flex='3' w='full' h='100vh' bg='coveyBlue.400'>
        <Flex minH='100vh'>
          <VStack w='full' h='100vh'>
            <Box w='full' h='10%' marginLeft='10%' marginTop='2.5%'>
              <HStack spacing={5}>
                <Box boxSize='5vh'>
                  <Image src='logo192.png' alt='Covey.Town logo' />
                </Box>
                <Text fontWeight='bold' fontSize='2em' color='gray.600'>
                  {' '}
                  Covey.Town{' '}
                </Text>
              </HStack>
            </Box>
            <Box w='full' h='100%' display='flex' alignItems='center' justifyContent='center'>
              <Text
                fontSize={{ base: '2em', sm: '2.5em', md: '4em', lg: '5em' }}
                fontWeight='650'
                marginBottom='35%'
                lineHeight='115%'
                color='white'
                paddingLeft={'5px'}
                paddingBottom={{ base: '0px', sm: '100px', md: '80px', lg: '0px' }}>
                {' '}
                A very cool video <br /> chat app.{' '}
              </Text>
            </Box>
          </VStack>
        </Flex>
      </Box>
    </>
  );
}

"use client";

import { Box, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { firestore } from '@/firebase';
import { collection, getDocs, query, setDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '1px solid #ddd',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}

const pantryBoxStyle = {
  border: '1px solid #ddd',
  borderRadius: '8px',
  padding: '24px',
  backgroundColor: '#D3D3D3',
  width: '1000px',
  maxWidth: '1200px',
  margin: '16px auto',
}

const titleStyle = {
  marginBottom: '14px',
  fontWeight: 'bold',
  textAlign: 'center',
}

const buttonStyle = {
  borderRadius: '8px',
}

export default function Home() {
  const [pantry, setPantry] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [removeQuantities, setRemoveQuantities] = useState({})
  const [error, setError] = useState('')
  
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'))
    const docs = await getDocs(snapshot)
    const pantryList = []
    docs.forEach((doc) => {
      pantryList.push({ name: doc.id, ...doc.data() });
    })
    setPantry(pantryList);
  }

  useEffect(() => {
    updatePantry();
  }, [])

  const addItem = async (item, quantity) => {
    if (!item) {
      setError('Item name is required')
      return
    }

    const quantityToAdd = quantity ? parseInt(quantity) : 1;
    if (isNaN(quantityToAdd) || quantityToAdd <= 0) {
      setError('Quantity must be a positive number')
      return
    }

    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      await setDoc(docRef, { count: count + quantityToAdd })
    } else {
      await setDoc(docRef, { count: quantityToAdd })
    }
    setError('')
    await updatePantry()
    handleClose()
  }

  const removeItem = async (item, quantityToRemove) => {
    const docRef = doc(collection(firestore, 'pantry'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { count } = docSnap.data()
      const removeCount = quantityToRemove ? parseInt(quantityToRemove) : 1
      if (isNaN(removeCount) || removeCount <= 0) {
        return
      }

      if (count <= removeCount) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: count - removeCount });
      }
    }
    setRemoveQuantities({});
    await updatePantry();
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      alignItems={'center'}
      flexDirection={'column'}
      gap={3}
      sx={{ bgcolor: '#CBC3E3', p: 2 }}
    >
      <Typography variant="h2" component="h1" sx={titleStyle}>
        Pantry List
      </Typography>
      <Button variant='contained' onClick={handleOpen} sx={buttonStyle}>
        Add Item
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Add Item
          </Typography>
          <Stack width="100%" spacing={2}>
            <TextField
              id="item-name"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <TextField
              id="item-quantity"
              label="Quantity"
              variant="outlined"
              fullWidth
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError('');  // Reset general error
              }}
              error={!!error}
              helperText={error}
              type="number"
              InputProps={{ inputProps: { min: 1 } }}
            />
            <Button
              variant="contained"
              onClick={() => addItem(itemName, quantity)}
              sx={buttonStyle}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box sx={pantryBoxStyle}>
        <Stack spacing={2} overflow={'auto'}>
          {pantry.map(({ name, count }) => (
            <Box
              key={name}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#ffffff'}
              border={'1px solid #ddd'}
              borderRadius={'8px'}
              padding={2}
              boxShadow={1}
            >
              <Typography variant={'h5'} color={'#333'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h5'} color={'#333'}>
                Quantity: {count}
              </Typography>
              <Stack direction={'row'} spacing={2} alignItems={'center'}>
                <TextField
                  id={`remove-quantity-${name}`}
                  label="Remove Quantity"
                  variant="outlined"
                  value={removeQuantities[name] || ''}
                  onChange={(e) => setRemoveQuantities({ ...removeQuantities, [name]: e.target.value })}
                  sx={{ width: '140px' }}
                  type="number"
                  InputProps={{ inputProps: { min: 1 } }}
                />
                <Stack direction={'row'} spacing={1}>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => removeItem(name, removeQuantities[name])}
                    sx={buttonStyle}
                  >
                    Remove by Quantity
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => removeItem(name, 1)}
                    sx={buttonStyle}
                  >
                    Remove
                  </Button>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

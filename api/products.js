import { getProducts, addProduct, updateProduct, deleteProduct } from './_database';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const products = await getProducts();
        res.status(200).json(products);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching products' });
      }
      break;

    case 'POST':
      try {
        const { title, tags, link } = req.body;
        await addProduct(title, tags, link);
        res.status(201).json({ message: 'Product added successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Error adding product' });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        const { title, tags, link } = req.body;
        await updateProduct(id, title, tags, link);
        res.status(200).json({ message: 'Product updated successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Error updating product' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        await deleteProduct(id);
        res.status(200).json({ message: 'Product deleted successfully' });
      } catch (error) {
        res.status(500).json({ error: 'Error deleting product' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
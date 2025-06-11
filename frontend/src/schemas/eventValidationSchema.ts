import * as Yup from "yup";

export const eventValidationSchema = Yup.object({
  title: Yup.string().required("Le titre est requis"),
  type: Yup.string().required("Le type est requis"),
  category: Yup.string().required("La catégorie est requise"),
  description: Yup.string().required("La description est requise"),
  date: Yup.string().required("La date est requise"),
  time: Yup.string().optional(),
  location: Yup.string().required("Le lieu est requis"),
  link: Yup.string().url("Lien invalide").optional(),
  image: Yup.string().url("URL d’image invalide").optional(),
  price: Yup.string().optional(),
  priceCurrency: Yup.string()
    .nullable()
    .when("price", (price, schema) =>
      price && price.trim() !== ""
        ? schema.required("Devise requise si prix fourni")
        : schema,
    ),
});

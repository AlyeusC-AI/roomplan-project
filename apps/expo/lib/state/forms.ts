// import { create } from 'zustand';
// import { api } from '../api';
// export interface FormField {
//   id: number;
//   type: string;
//   name: string;
//   isRequired: boolean;
//   options?: Array<{ value: string; name: string; }>;
// }
// export interface Form {
//   id: string;
//   name: string;
//   description?: string;
//   responseCount?: number;
//   sections?: Array<{
//     id: string;
//     name: string;
//     fields: FormField[];
//   }>;
//   createdAt?: string;
//   updatedAt?: string;
// }

// interface FormsState {
//   forms: { [key: string]: Form };
//   formsList: Form[];
//   responseCounts: { [key: string]: number };
//   responses: {
//     id:number,
//     created_at:string,
//     date:string,
//     formId:number,
//     projectId:number,
//     form:Form,
//     fields: {
//       id:number,
//         field:FormField,
//       value:string,
//       created_at:string,
//       formFieldId:number,
//       formResponseId:number
//     }[]

//  }[],

//   loading: boolean;
//   error: string | null;
//   getForm: (projectId: string, formId: string) => Promise<Form | null>;
//   getForms: (projectId: string) => Promise<void>;
//   setForm: (form: Form) => void;
//   clearForms: () => void;
// }

// export const useFormsStore = create<FormsState>((set, get) => ({
//   forms: {},
//   formsList: [],
//   responseCounts: {},
//   responses: [],
//   loading: false,
//   error: null,
//   getForms: async (projectId: string) => {
//     set({ loading: true, error: null });
//     try {
//       const [formsResponse, responsesResponse] = await Promise.all([
//         api.get(`/api/v1/projects/${projectId}/forms`),
//         api.get(`/api/v1/projects/${projectId}/forms/responses`)
//       ]);
//       console.log("🚀 ~ getForms: ~ formsResponse:", formsResponse)

//       const forms = formsResponse.data.forms;
//       const formsList = forms;

//       // Create forms dictionary
//       const formsDict = forms.reduce((acc: { [key: string]: Form }, form: Form) => {
//         acc[form.id] = form;
//         return acc;
//       }, {});

//       // Calculate response counts
//       const counts = responsesResponse.data.responses.reduce((acc: {[key: string]: number}, response: any) => {
//         acc[response.formId] = (acc[response.formId] || 0) + 1;
//         return acc;
//       }, {});

//       set((state) => ({
//         forms: { ...state.forms, ...formsDict },
//         formsList,
//         responseCounts: counts,
//         loading: false,
//         responses: responsesResponse.data.responses
//       }));
//     } catch (error) {
//       set({ error: 'Failed to fetch forms', loading: false });
//     }
//   },
//   getForm: async (projectId: string, formId: string) => {
//     // Check if we already have the form in store
//     const existingForm = get().forms[formId];
//     if (existingForm) {
//       return existingForm;
//     }

//     // If not, fetch all forms and find the one we need
//     set({ loading: true, error: null });
//     try {
//       await get().getForms(projectId);
//       const form = get().forms[formId];
//       if (!form) {
//         throw new Error('Form not found');
//       }
//       return form;
//     } catch (error) {
//       set({ error: 'Failed to fetch form', loading: false });
//       return null;
//     }
//   },
//   setForm: (form: Form) => {
//     set((state) => ({
//       forms: { ...state.forms, [form.id]: form }
//     }));
//   },
//   clearForms: () => {
//     set({ forms: {}, formsList: [], responseCounts: {}, error: null });
//   }
// }));

// // "id": 6,
// // "created_at": "2025-03-20T23:08:21.984886+00:00",
// // "date": "2025-03-20T23:08:21.816",
// // "formId": 21,
// // "projectId": 299,
// // "form": {
// //   "id": 21,
// //   "desc": "",
// //   "name": "test",
// //   "orgId": 2,
// //   "sections": [
// //     {
// //       "id": 28,
// //       "name": "Section 1",
// //       "fields": [
// //         {
// //           "id": 89,
// //           "name": "New Field1",
// //           "type": "TEXT",
// //           "order": 1,
// //           "options": [],
// //           "sectionId": 28,
// //           "created_at": "2025-03-20T18:53:49.777006+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 90,
// //           "name": "New Field2",
// //           "type": "CHECKBOX",
// //           "order": 2,
// //           "options": [
// //             {
// //               "id": 329,
// //               "name": "Option 1",
// //               "order": 1,
// //               "value": "option-1",
// //               "created_at": "2025-03-20T22:54:43.723353+00:00",
// //               "formFieldId": 90
// //             },
// //             {
// //               "id": 330,
// //               "name": "Option 2",
// //               "order": 2,
// //               "value": "option-2",
// //               "created_at": "2025-03-20T22:54:43.723353+00:00",
// //               "formFieldId": 90
// //             }
// //           ],
// //           "sectionId": 28,
// //           "created_at": "2025-03-20T18:53:51.969505+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 91,
// //           "name": "New Field3",
// //           "type": "NUMBER",
// //           "order": 3,
// //           "options": [],
// //           "sectionId": 28,
// //           "created_at": "2025-03-20T18:53:59.89557+00:00",
// //           "isRequired": false
// //         }
// //       ],
// //       "formId": 21,
// //       "created_at": "2025-03-20T18:53:48.295514+00:00"
// //     },
// //     {
// //       "id": 29,
// //       "name": "Section 2",
// //       "fields": [
// //         {
// //           "id": 92,
// //           "name": "long question",
// //           "type": "TEXTAREA",
// //           "order": 1,
// //           "options": [],
// //           "sectionId": 29,
// //           "created_at": "2025-03-20T22:50:13.540765+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 93,
// //           "name": "date of something",
// //           "type": "DATE",
// //           "order": 2,
// //           "options": [],
// //           "sectionId": 29,
// //           "created_at": "2025-03-20T22:51:31.996965+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 94,
// //           "name": "just one of options",
// //           "type": "RADIO",
// //           "order": 3,
// //           "options": [
// //             {
// //               "id": 331,
// //               "name": "Option 1",
// //               "order": 1,
// //               "value": "option-1",
// //               "created_at": "2025-03-20T22:54:44.484885+00:00",
// //               "formFieldId": 94
// //             },
// //             {
// //               "id": 332,
// //               "name": "Option 2",
// //               "order": 2,
// //               "value": "option-2",
// //               "created_at": "2025-03-20T22:54:44.484885+00:00",
// //               "formFieldId": 94
// //             }
// //           ],
// //           "sectionId": 29,
// //           "created_at": "2025-03-20T22:51:55.230656+00:00",
// //           "isRequired": false
// //         }
// //       ],
// //       "formId": 21,
// //       "created_at": "2025-03-20T22:50:10.035818+00:00"
// //     },
// //     {
// //       "id": 31,
// //       "name": "Section 3",
// //       "fields": [
// //         {
// //           "id": 95,
// //           "name": "select field",
// //           "type": "SELECT",
// //           "order": 1,
// //           "options": [
// //             {
// //               "id": 333,
// //               "name": "Option 1",
// //               "order": 1,
// //               "value": "option-1",
// //               "created_at": "2025-03-20T22:54:44.835016+00:00",
// //               "formFieldId": 95
// //             },
// //             {
// //               "id": 334,
// //               "name": "Option 2",
// //               "order": 2,
// //               "value": "option-2",
// //               "created_at": "2025-03-20T22:54:44.835016+00:00",
// //               "formFieldId": 95
// //             }
// //           ],
// //           "sectionId": 31,
// //           "created_at": "2025-03-20T22:52:20.585457+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 96,
// //           "name": "upload file",
// //           "type": "FILE",
// //           "order": 1,
// //           "options": [],
// //           "sectionId": 31,
// //           "created_at": "2025-03-20T22:52:22.544105+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 97,
// //           "name": "upload image",
// //           "type": "IMAGE",
// //           "order": 3,
// //           "options": [],
// //           "sectionId": 31,
// //           "created_at": "2025-03-20T22:53:03.768217+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 98,
// //           "name": "give rate",
// //           "type": "RATING",
// //           "order": 4,
// //           "options": [],
// //           "sectionId": 31,
// //           "created_at": "2025-03-20T22:53:16.278073+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 99,
// //           "name": "client signature",
// //           "type": "SIGNATURE",
// //           "order": 5,
// //           "options": [],
// //           "sectionId": 31,
// //           "created_at": "2025-03-20T22:53:29.402788+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 100,
// //           "name": "time of",
// //           "type": "TIME",
// //           "order": 6,
// //           "options": [],
// //           "sectionId": 31,
// //           "created_at": "2025-03-20T22:53:51.669216+00:00",
// //           "isRequired": false
// //         },
// //         {
// //           "id": 101,
// //           "name": "New Field7",
// //           "type": "TEXT",
// //           "order": 7,
// //           "options": [],
// //           "sectionId": 31,
// //           "created_at": "2025-03-20T22:53:53.692978+00:00",
// //           "isRequired": false
// //         }
// //       ],
// //       "formId": 21,
// //       "created_at": "2025-03-20T22:52:20.388135+00:00"
// //     },
// //     {
// //       "id": 30,
// //       "name": "Section 3",
// //       "fields": [],
// //       "formId": 21,
// //       "created_at": "2025-03-20T22:52:18.619494+00:00"
// //     }
// //   ],
// //   "created_at": "2025-03-20T18:40:09.918398+00:00",
// //   "damageTypes": [
// //     "mold"
// //   ]
// // },
// // "fields": [
// //   {
// //     "id": 35,
// //     "field": {
// //       "id": 96,
// //       "name": "upload file",
// //       "type": "FILE",
// //       "order": 1,
// //       "sectionId": 31,
// //       "created_at": "2025-03-20T22:52:22.544105+00:00",
// //       "isRequired": false
// //     },
// //     "value": "{\"url\":\"https://ik.imagekit.io/wzgdjvwfm/form-uploads/1742512096558_Image_created_with_a_mobile_phone_YJpgEBhZb.png\",\"name\":\"Image_created_with_a_mobile_phone.png\",\"size\":58459,\"type\":\"image/png\"}",
// //     "created_at": "2025-03-20T23:08:22.187823+00:00",
// //     "formFieldId": 96,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 36,
// //     "field": {
// //       "id": 97,
// //       "name": "upload image",
// //       "type": "IMAGE",
// //       "order": 3,
// //       "sectionId": 31,
// //       "created_at": "2025-03-20T22:53:03.768217+00:00",
// //       "isRequired": false
// //     },
// //     "value": "{\"url\":\"https://ik.imagekit.io/wzgdjvwfm/form-uploads/1742512085522_Image_created_with_a_mobile_phone_Q5zpTJ9P2.png\",\"name\":\"Image_created_with_a_mobile_phone.png\",\"size\":58459,\"type\":\"image/png\"}",
// //     "created_at": "2025-03-20T23:08:22.187823+00:00",
// //     "formFieldId": 97,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 37,
// //     "field": {
// //       "id": 89,
// //       "name": "New Field1",
// //       "type": "TEXT",
// //       "order": 1,
// //       "sectionId": 28,
// //       "created_at": "2025-03-20T18:53:49.777006+00:00",
// //       "isRequired": false
// //     },
// //     "value": "test 1",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 89,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 38,
// //     "field": {
// //       "id": 90,
// //       "name": "New Field2",
// //       "type": "CHECKBOX",
// //       "order": 2,
// //       "sectionId": 28,
// //       "created_at": "2025-03-20T18:53:51.969505+00:00",
// //       "isRequired": false
// //     },
// //     "value": "[\"option-1\"]",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 90,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 39,
// //     "field": {
// //       "id": 91,
// //       "name": "New Field3",
// //       "type": "NUMBER",
// //       "order": 3,
// //       "sectionId": 28,
// //       "created_at": "2025-03-20T18:53:59.89557+00:00",
// //       "isRequired": false
// //     },
// //     "value": "1233",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 91,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 40,
// //     "field": {
// //       "id": 92,
// //       "name": "long question",
// //       "type": "TEXTAREA",
// //       "order": 1,
// //       "sectionId": 29,
// //       "created_at": "2025-03-20T22:50:13.540765+00:00",
// //       "isRequired": false
// //     },
// //     "value": "long questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong questionlong question",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 92,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 41,
// //     "field": {
// //       "id": 93,
// //       "name": "date of something",
// //       "type": "DATE",
// //       "order": 2,
// //       "sectionId": 29,
// //       "created_at": "2025-03-20T22:51:31.996965+00:00",
// //       "isRequired": false
// //     },
// //     "value": "2025-03-20",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 93,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 42,
// //     "field": {
// //       "id": 94,
// //       "name": "just one of options",
// //       "type": "RADIO",
// //       "order": 3,
// //       "sectionId": 29,
// //       "created_at": "2025-03-20T22:51:55.230656+00:00",
// //       "isRequired": false
// //     },
// //     "value": "option-1",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 94,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 43,
// //     "field": {
// //       "id": 95,
// //       "name": "select field",
// //       "type": "SELECT",
// //       "order": 1,
// //       "sectionId": 31,
// //       "created_at": "2025-03-20T22:52:20.585457+00:00",
// //       "isRequired": false
// //     },
// //     "value": "option-2",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 95,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 44,
// //     "field": {
// //       "id": 96,
// //       "name": "upload file",
// //       "type": "FILE",
// //       "order": 1,
// //       "sectionId": 31,
// //       "created_at": "2025-03-20T22:52:22.544105+00:00",
// //       "isRequired": false
// //     },
// //     "value": "{\"url\":\"https://ik.imagekit.io/wzgdjvwfm/form-uploads/1742512096558_Image_created_with_a_mobile_phone_YJpgEBhZb.png\",\"name\":\"Image_created_with_a_mobile_phone.png\",\"size\":58459,\"type\":\"image/png\"}",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 96,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 45,
// //     "field": {
// //       "id": 97,
// //       "name": "upload image",
// //       "type": "IMAGE",
// //       "order": 3,
// //       "sectionId": 31,
// //       "created_at": "2025-03-20T22:53:03.768217+00:00",
// //       "isRequired": false
// //     },
// //     "value": "{\"url\":\"https://ik.imagekit.io/wzgdjvwfm/form-uploads/1742512085522_Image_created_with_a_mobile_phone_Q5zpTJ9P2.png\",\"name\":\"Image_created_with_a_mobile_phone.png\",\"size\":58459,\"type\":\"image/png\"}",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 97,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 46,
// //     "field": {
// //       "id": 98,
// //       "name": "give rate",
// //       "type": "RATING",
// //       "order": 4,
// //       "sectionId": 31,
// //       "created_at": "2025-03-20T22:53:16.278073+00:00",
// //       "isRequired": false
// //     },
// //     "value": "4",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 98,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 47,
// //     "field": {
// //       "id": 99,
// //       "name": "client signature",
// //       "type": "SIGNATURE",
// //       "order": 5,
// //       "sectionId": 31,
// //       "created_at": "2025-03-20T22:53:29.402788+00:00",
// //       "isRequired": false
// //     },
// //     "value": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABHQAAAEACAYAAADShyHGAAAAAXNSR0IArs4c6QAAIABJREFUeF7t3Y11HLfZBtBVB0oHTAd0BYo7SCow1YFdgZMK4g5EVxCngnysIOxA7CDqgN95GcMZr3ZmMP8A5u45OqLNGQxwAe3PswDm3evr6+vFgwABAgQIECBAgAABAgQIECBAoBqBdwKdavpKRQkQIECAAAECBAgQIECAAAECbwICHQOBAAECBAgQIECAAAECBAgQIFCZgECnsg5TXQIECBAgQIAAAQIECBAgQICAQMcYIECAAAECBAgQIECAAAECBAhUJiDQqazDVJcAAQIECBAgQIAAAQIECBAgINAxBggQIECAAAECBAgQIECAAAEClQkIdCrrMNUlQIAAAQIECBAgQIAAAQIECAh0jAECBAgQIECAAAECBAgQIECAQGUCAp3KOkx1CRAgQIAAAQIECBAgQIAAAQICHWOAAAECBAgQIECAAAECBAgQIFCZgECnsg5TXQIECBAgQIAAAQIECBAgQICAQMcYIECAAAECBAgQIECAAAECBAhUJiDQqazDVJcAAQIECBAgQIAAAQIECBAgINAxBggQIECAAAECBAgQIECAAAEClQkIdCrrMNUlQIAAAQIECBAgQIAAAQIECAh0jAECBAgQIECAAAECBAgQIECAQGUCAp3KOkx1CRAgQIAAAQIECBAgQIAAAQICHWOAAAECBAgQIECAAAECBAgQIFCZgECnsg5TXQIECBAgQIAAAQIECBAgQICAQMcYIECAAAECBAgQIECAAAECBAhUJiDQqazDVJcAAQIECBAgQIAAAQIECBAgINAxBggQIECAAAECBAgQIECAAAEClQkIdCrrMNUlQIAAAQIECBAgQIAAAQIECAh0jAECBAgQIECAAAECBAgQIECAQGUCAp3KOkx1CRAgQIAAAQIECBAgQIAAAQICHWOAAAECBAgQIECAAAECBAgQIFCZgECnsg5TXQIECBAgQIAAAQIECBAgQICAQMcYIECAAAECBAgQIECAAAECBAhUJiDQqazDVJcAAQIECBAgQIAAAQIECBAgINAxBggQIECAAAECBAgQIECAAAEClQkIdCrrMNUlQIAAAQIECBAgQIAAAQIECAh0jAECBAgQIECAAAECBAgQIECAQGUCAp3KOkx1CRAgQIAAAQIECBAgQIAAAQICHWOAAAECBAgQIECAAAECBAgQIFCZgECnsg5TXQIECBAgQIAAAQIECBAgQICAQMcYIECAAAECBAgQIECAAAECBAhUJiDQqazDVJcAAQIECBAgQIAAAQIECBAgINAxBggQIECAAAECBAgQIECAAAEClQkIdCrrMNUlQIAAAQIECBAgQIAAAQIECAh0jAECBAgQIECAAAECBAgQIECAQGUCAp3KOkx1CRAgQIAAAQIECBAgQIAAAQICHWOAAAECBAgQIECAAAECBAgQIFCZgECnsg5TXQIECBAgQIAAAQIECBAgQICAQMcYIECAAAECBAgQIECAAAECBAhUJiDQqazDVJcAAQIECBAgQIAAAQIECBAgINAxBggQIECAAAECBAgQIECAAAEClQkIdCrrMNUlQIAAAQIECBAgQIAAAQIECAh0jAECBAgQIECAAAECBAgQIECAQGUCAp3KOkx1CRAgQIAAAQIECBAgQIAAAQICHWOAAAECBAgQIECAAAECBAgQIFCZgECnsg5TXQIECBAgQIAAAQIECBAgQICAQMcYIECAAAECBAgQIECAAAECBAhUJiDQqazDVJcAAQIECBAgQIAAAQIECBAgINAxBggQIECAAAECBAgQIECAAAEClQkIdCrrMNUlQIAAAQIECBDYX+D//u//frvo09PTbz93//91rf70pz9d0u/j5x9//HH/irsiAQIECDQrINBptms1jAABAgQIECCwn0AEF90AY+zK6dj4e+mjL1TpBi9D1/jw4cOle+zLy8sl/qTHUGgzp+5//etf304T8MzRcw4BAgQIJAGBjrFAgAABAgQIECDwO4FuOBNBx3Xg0f392mFHqkgKetK14v/Hz3d3d78LW1rqum4gFqGPwKel3tUWAgQIrC8g0FnfVIkECBAgQIAAgWIFUgATQc11GLNVOFMsRuEVE+oU3kGqR4AAgYMFBDoHd4DLEyBAgAABAgS2EoiAphvcCGy2kt6u3NfX1+0KVzIBAgQIVC0g0Km6+1SeAAECBAgQIPDfpUixXOdvf/vbG0f8t/CmjZEh0GmjH7WCAAECWwgIdLZQVSYBAgQIECBAYEOBCGsivIkQ55dffrk8Pz9veDVFHyVgydVR8q5LgACBOgQEOnX0k1oSIECAAAECJxRIs2y6M2/2Yoiw6NadqNIGyfH32OPW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",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 99,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 48,
// //     "field": {
// //       "id": 100,
// //       "name": "time of",
// //       "type": "TIME",
// //       "order": 6,
// //       "sectionId": 31,
// //       "created_at": "2025-03-20T22:53:51.669216+00:00",
// //       "isRequired": false
// //     },
// //     "value": "20:39",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 100,
// //     "formResponseId": 6
// //   },
// //   {
// //     "id": 49,
// //     "field": {
// //       "id": 101,
// //       "name": "New Field7",
// //       "type": "TEXT",
// //       "order": 7,
// //       "sectionId": 31,
// //       "created_at": "2025-03-20T22:53:53.692978+00:00",
// //       "isRequired": false
// //     },
// //     "value": "long question",
// //     "created_at": "2025-03-21T01:39:06.084044+00:00",
// //     "formFieldId": 101,
// //     "formResponseId": 6
// //   }
// // ]
// // }

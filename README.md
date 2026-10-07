# Campus Lost & Found AI

Campus Lost & Found AI is a web application made for college students to report and find lost or found items on campus.

Instead of checking different groups or asking people individually, students can add the details of an item to the application and check for possible matches.

## About the Project

The main idea of this project is to make the lost and found process easier inside a college campus.

A student can report an item as either **Lost** or **Found**. The application stores the item details and compares lost items with found items to find possible matches.

## Features

* Report a lost item
* Report a found item
* Add item details such as name, category, color and location
* Add date, time and description
* Add an image of the item
* View lost items
* View found items
* Search and filter items
* Check possible matches
* See the match percentage and reasons for the match
* Login and registration
* Dashboard to view reported items

## How Matching Works

The application compares the details of lost and found items.

Some of the details considered are:

* Category
* Color
* Location
* Item name and description
* Date
* Image availability

Based on these details, the application gives a possible match percentage.

For example:

```text
Possible Match: 92%
```

It also shows why the two items were considered a possible match.

## Technologies Used

**Frontend**

* React
* TypeScript
* Vite
* HTML
* CSS

**Backend**

* Python
* FastAPI

**Database**

* MongoDB

## Basic Working

```text
Student
   ↓
Report Lost / Found Item
   ↓
React Frontend
   ↓
FastAPI Backend
   ↓
MongoDB
   ↓
Compare Lost & Found Items
   ↓
Show Possible Matches
```

## API Endpoints

| Method | Endpoint               | Purpose              |
| ------ | ---------------------- | -------------------- |
| GET    | `/api/`                | Check API            |
| GET    | `/api/items`           | Get items            |
| POST   | `/api/items`           | Add an item          |
| GET    | `/api/items/matches`   | Get possible matches |
| GET    | `/api/items/{item_id}` | Get one item         |
| GET    | `/api/status`          | Check system status  |

## Database

MongoDB is used to store the lost and found item details.

The stored information includes things like:

* Item name
* Category
* Color
* Location
* Date and time
* Description
* Contact details
* Image
* Status

## Future Improvements

Some features that can be added later are:

* Better AI/ML based matching
* Image similarity matching
* Email notifications
* Better user authentication
* Item claiming and verification
* Admin panel
* Cloud image storage

## Project

**Campus Lost & Found AI**

This project was developed as a college project to provide a simple way for students to report and find lost items on campus.

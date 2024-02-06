#  Cognimate

## About Us
We are a group of students from diverse backgrounds (Computer Science, Math, IEM) working on the project together. We are **Team 52 Reference Code 5E**, and we have built our very own GenAI platform **Cognimate**. You can find our youtube video [here](https://youtu.be/peoIeybufoQ) too.

## How to Use
You can access our website [here](https://cognimate.vercel.app/course)

## Architecture Overview

![genai diagram](https://i.imgur.com/8fJBlQu.png)

We are mainly building our system in JavaScript environment, whereby we leverage technologies like `NextJS`, `tRPC`, and `Prisma`. For the data tier, we are using industry level technologies like `Amazon S3`, `Pinecone`, and `PostgreSQL` with `Supabase`. On top of that, our system also rely on external APIs from `OpenAI's ChatGPT`, `Unsplash Image` for the image generation, and `Youtube API` for the video query retrieval.

![genai diagram](https://i.imgur.com/MjtJgAO.png)

The following diagram above shows our use of GenAI technology in further detail.


## What it Does
A Generative AI (GenAI) Course Builder and Summariser that allows students to curate personalised educational material for self-study and revision purposes. We provide 2 main functionality (1) Course building and (2) Course summarising. In our course builder, students can define the course and sub-topics they want to build, *Cognimate* will aid students in generating chapters and source for top videos that students can browse to learn more about the topic. As for the course summarisation, students will upload a PDF which will be summarised by *Cognimate*. To further value add, quiz questions will be provided and a chatbot preset with context is made available to enhance learning.


## Challenges we ran into
We were not able to get the generative models to output consistent questions and answers that conform to Singapore's educational system methodology. We had to perform different types of prompt engineering and tweaking of our solution to collect the required data which eventually acted as parameters for giving a meaningful prompt to generate personalised content for students.

## What's Next for Cognimate
1. In order to reduce cost overhead and load-time, we can shift our application to use open source models such as Llama which are deployed on self-hosted GPU clusters, allowing for more concurrent users and scalability.
2. Extending the use case from Singaporean students to other countries. This would include provision of support for languages other than English and to also deep dive into the needs of students for different counties.


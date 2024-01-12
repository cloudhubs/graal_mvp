# Microservice Visualization Platform (MVP)

Our architecture visualization proof-of-concept primarily aims to provide an interactive visualization of a microservice
system's service and domain views. This tool is custom for the usage of the *Software Architecture Reconstruction of
Microservice Systems with GraalVM Native Image* project.

## Whole Platform in One Command

- We have a [Dockerfile](./Dockerfile) containing all the steps necessary to install and run our tools.
- Executing the script [run.sh](./run.sh) should build the image and start the container.
  - If you encounter issues, please feel free to contact us, we can share the image.
- Then just access [localhost:3000](http://localhost:3000/) to see the MVP containing the data extracted from
  train-ticket.

## Features:

- upload and visualize service dependency graph
- upload and visualize context map
  - selected microservices and view sub-context map of those select nodes
- upload two service dependency graphs and view their similarities and differences
- very early stage code coverage visualization
- *Note: as of current, the backend (designed for antipattern detection) is not used by the frontend application*

## Software Architecture Reconstruction of Microservice Systems with GraalVM Native Image Project Repositories:

- Phase 1 (Byte Code Analysis Extraction): https://github.com/cloudhubs/graal
- Phase 2 (Creation of Service Dependency Graph JSON and Context Map
  JSON): https://github.com/cloudhubs/graal-prophet-utils
- Phase 3 (visualization of system): this tool

## Requirements:

- Node
- Custom JSON for service dependency graph and context map in the format shown in the Phase 2 repository

## Installation:

1. from root of the *frontend directory*, run ```npm install```
2. then run ```npm start```

## Service Dependency Graph Usage:

- *by default, the service dependency graph of v1.0.0 of the benchmark
  microservice [Train Ticket](https://github.com/FudanSELab/train-ticket) is used*
- from the left drop-down menu, change the mode to *Comm Graph*
- from the menu on the right side of the screen, click *import* and select the desired service dependency JSON to
  visualize
- clicking on nodes (microservices) reveals microservice dependents and dependencies
- clicking on directed links depicts calls and their HTTP Type

## Context Map Usage:

- *by default, the context map of v1.0.0 of the benchmark
  microservice [Train Ticket](https://github.com/FudanSELab/train-ticket) is used*
- from the left drop-down menu, change the mode to *Context Map*
-

## Sub Context Map Usage:

- While in the *Context Map* mode, right click on nodes to add to list on the right of the screen
- nodes can be deleted by clicking on the node from the list
- click on list button to visualize sub-context map of selected nodes

## Microservice Architecture Usage:

- From the right menu of the screen in the *Commm Graph Mode*, two different service dependency graphs may be selected (
  A and B)
- Differences and similarities are color-coded

## Code Coverage

- The very beginnings of a code coverage feature is in place. The format for 

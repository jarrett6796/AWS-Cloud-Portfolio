---
title: Architecture
---
# Architecture Diagram
A browser reaches an EC2 instance through allowed inbound HTTP traffic. Apache serves the website from the Linux host.

# System Module
| Layer | Service or Component |
| --- | --- |
| Compute Layer | EC2 |
| OS Layer | Linux |
| Web Layer | Apache |
| Network Layer | Security Groups |

# Workflow
| Step | Component | Role |
| --- | --- | --- |
| 1 | Browser | Sends HTTP request |
| 2 | Security Group | Allows inbound HTTP |
| 3 | EC2 | Hosts the server |
| 4 | Apache | Serves website files |

# Technology Stack
| Area | Technologies |
| --- | --- |
| Cloud | AWS |
| Compute | EC2 |
| Operating System | Linux |
| Web Server | Apache |
| Network | Security Groups |

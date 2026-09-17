# Computer Networks & Data Communication (CNDC) Placement Guide

## 1. Overview & Architecture Fundamentals
Computer Networks and Data Communication (CNDC) is a core subject in campus placement technical rounds for Software Engineering and Systems roles. Recruiters (including Microsoft, Amazon, Cisco, and fintech firms) focus heavily on conceptual clarity of layered architectures, protocol differences, packet flows, and real-world debugging.

### Key Conceptual Layers:
- **OSI Model (7 Layers)**: Conceptual and standardized reference framework.
  1. **Physical Layer**: Bit transmission over physical medium (cables, radio waves, repeaters, hubs).
  2. **Data Link Layer**: Node-to-node hop delivery, framing, MAC addressing, error detection (CRC), flow control. Protocols: Ethernet, ARP, PPP. Devices: Switches, Bridges.
  3. **Network Layer**: End-to-end host-to-host delivery, logical IP addressing, packet routing. Protocols: IPv4, IPv6, ICMP, IGMP, OSPF, BGP. Devices: Routers.
  4. **Transport Layer**: End-to-end process-to-process delivery (ports), segmentation, flow control, congestion control, reliability. Protocols: TCP, UDP.
  5. **Session Layer**: Establishing, managing, and terminating communication sessions between applications (RPC, NetBIOS).
  6. **Presentation Layer**: Data formatting, syntax translation, data compression, and encryption/decryption (SSL/TLS, ASCII, JPEG).
  7. **Application Layer**: User interface interaction, network application services. Protocols: HTTP/HTTPS, DNS, FTP, SMTP, SSH, WebSocket.

- **TCP/IP Model (4 Layers)**: Practical implementation model used in the modern Internet:
  1. Network Access / Link Layer (combines OSI Physical & Data Link)
  2. Internet Layer (corresponds to OSI Network Layer)
  3. Transport Layer (corresponds to OSI Transport Layer)
  4. Application Layer (combines OSI Session, Presentation, and Application Layers)

---

## 2. Transport Layer: TCP vs UDP In-Depth

### Comparison Summary
- **TCP (Transmission Control Protocol)**:
  - Connection-oriented: Requires 3-way handshake (`SYN` -> `SYN-ACK` -> `ACK`) before data transmission, and 4-way handshake for connection teardown (`FIN` -> `ACK` -> `FIN` -> `ACK`).
  - Reliable: Guarantees delivery via sequence numbers, positive acknowledgments (ACKs), checksums, and automatic retransmission (ARQ / Timeout).
  - Ordered: Byte stream arrived in sequence; reassembles out-of-order packets.
  - Flow & Congestion Control: Sliding window mechanism prevents receiver buffer overflow; AIMD (Additive Increase Multiplicative Decrease), slow start, and congestion avoidance algorithms manage network congestion.
  - Header Size: 20 to 60 bytes.
  - Use Cases: Web browsing (HTTP/HTTPS), File transfers (FTP/SFTP), Secure shell (SSH), Email (SMTP/IMAP).

- **UDP (User Datagram Protocol)**:
  - Connectionless: Sends datagrams immediately without handshake or setup overhead.
  - Unreliable (Best-effort): No acknowledgments, no automatic retransmission, packets may be dropped or duplicated.
  - Unordered: Packets can arrive out of order; applications handle ordering if needed.
  - Minimal Overhead: Fixed 8-byte header (Source Port, Destination Port, Length, Checksum).
  - High Speed & Low Latency: No handshake delay, no retransmission delays.
  - Use Cases: Real-time video/audio streaming (VoIP, WebRTC), online multiplayer gaming, DNS queries, DHCP, SNMP.

---

## 3. Network Layer: IP Addressing, Subnetting & Routing

### IP Addressing & CIDR Subnetting
- **IPv4 vs IPv6**:
  - IPv4: 32-bit address space (~4.3 billion addresses), dotted-decimal notation (`192.168.1.1`).
  - IPv6: 128-bit address space, hexadecimal notation (`2001:0db8:85a3::8a2e:0370:7334`). Solves IPv4 address exhaustion.
- **CIDR (Classless Inter-Domain Routing)**:
  - Notation: `IP/Prefix` (e.g., `192.168.1.0/24`). Prefix length specifies the number of continuous network bits.
  - Number of usable hosts = $2^{(32 - \text{prefix})} - 2$ (subtract 2 for Network ID and Broadcast address).
- **Private vs Public IP Addresses**:
  - Private IP ranges (RFC 1918): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`.
  - NAT (Network Address Translation): Translates private IP addresses to a public IP to enable Internet routing and conserve IP space.

### Routing Protocols
- **Distance Vector**: Bellman-Ford algorithm (e.g., RIP). Susceptible to count-to-infinity problem.
- **Link State**: Dijkstra's algorithm (e.g., OSPF). Routers have full network topology graph.
- **Path Vector**: BGP (Border Gateway Protocol) for inter-Autonomous System (AS) routing across the Internet backbone.

---

## 4. Application Layer: Web Protocols & Security

### HTTP Evolution
- **HTTP/1.1**: Persistent TCP connections (Keep-Alive), but suffers from Head-of-Line (HoL) blocking at the HTTP request level.
- **HTTP/2**: Binary framing layer, multiplexed bidirectional streams over a single TCP connection, header compression (HPACK), server push.
- **HTTP/3**: Built on **QUIC** protocol over **UDP**. Eliminates TCP Head-of-Line blocking at the transport layer, faster 0-RTT handshakes, connection migration across IP changes.

### DNS (Domain Name System) Resolution Flow
1. Browser cache check -> OS cache -> Router cache -> Local Resolver (ISP DNS).
2. Recursive query sent to **Root DNS Server** (`.`).
3. Root server directs to **TLD DNS Server** (e.g., `.com`).
4. TLD server directs to **Authoritative DNS Server** (e.g., `cloudflare.com`).
5. Authoritative server returns IP address (A / AAAA record).
6. Local resolver caches the record with TTL (Time To Live).

### HTTPS & TLS Handshake
- HTTPS = HTTP over TLS (Transport Layer Security, port 443).
- Uses asymmetric encryption (RSA/ECC) during the handshake to negotiate a symmetric session key (AES), then uses symmetric encryption for fast data transmission.

---

## 5. Core Placement Interview Questions for CNDC

1. **Explain what happens when you type `https://www.google.com` into your browser and press Enter.**
   - Answer covers: DNS resolution, TCP 3-way handshake, TLS cryptographic handshake, HTTP GET request, Web server processing & response, Browser DOM rendering.
2. **Why does DNS primarily use UDP on port 53, but sometimes use TCP?**
   - UDP for speed and low overhead on standard queries under 512 bytes; TCP for zone transfers between DNS servers or when responses exceed 512 bytes (EDNS0 fallback).
3. **What is the difference between MAC address and IP address?**
   - MAC address is physical, globally unique (burned in NIC), operates at Layer 2 for local network hops. IP address is logical, hierarchical, operates at Layer 3 for global Internet routing.
4. **How does ARP (Address Resolution Protocol) work?**
   - Resolves known IP address to unknown MAC address on local LAN using ARP Request (broadcast `FF:FF:FF:FF:FF:FF`) and ARP Reply (unicast).
5. **What is Head-of-Line (HoL) blocking?**
   - Occurs when a single delayed or dropped packet halts the processing of all subsequent queued packets. Solved in HTTP/2 at application level and in HTTP/3 (QUIC) at transport level.

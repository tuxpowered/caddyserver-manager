import socket
import struct

def get_source_ip():
    # Create a raw socket to sniff TCP packets
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_RAW, socket.IPPROTO_TCP)
        print("Sniffing source IPs on port 2222...")
        while True:
            packet = s.recvfrom(65565)
            packet = packet[0]
            
            # IP header is the first 20 bytes
            ip_header = packet[0:20]
            iph = struct.unpack('!BBHHHBBH4s4s', ip_header)
            
            src_addr = socket.inet_ntoa(iph[8])
            
            # TCP header is after IP header
            tcp_header = packet[20:40]
            tcph = struct.unpack('!HHLLBBHHH', tcp_header)
            
            dest_port = tcph[1]
            
            print(f"Connection attempt to port {dest_port} from: {src_addr}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    get_source_ip()

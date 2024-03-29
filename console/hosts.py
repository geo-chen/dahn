import re

# Read the file
with open('/var/log/dahn/generated_response.txt', 'r') as file:
    content = file.read()

# Use regular expression to find all occurrences of the pattern
matches = re.findall(r'(\d+) hosts up', content)

if matches:
    # Extract the last occurrence
    hosts_up_count = int(matches[-1])
    print("Number of hosts up:", hosts_up_count)

    # Write the count to a new file
    with open('hosts_up_count.txt', 'w') as output_file:
        output_file.write(str(hosts_up_count))
        print("Number of hosts up written to hosts_up_count.txt")
else:
    print("No match found for the number of hosts up.")


# Use regular expression to find all occurrences of the IP address pattern
ip_addresses = re.findall(r'Nmap scan report for (\d+\.\d+\.\d+\.\d+)', content)
if ip_addresses:
    # Extract the unique IP addresses
    unique_ip_addresses = set(ip_addresses)

    # Convert IP addresses to tuples containing the integer representation and the IP address string
    ip_address_tuples = [(int(''.join(map(lambda x: '{:03d}'.format(int(x)), ip.split('.')))), ip) for ip in unique_ip_addresses]

    # Sort the tuples by the integer representation
    sorted_ip_address_tuples = sorted(ip_address_tuples, key=lambda x: x[0])

    # Extract sorted IP addresses
    sorted_ip_addresses = [ip for _, ip in sorted_ip_address_tuples]

    print("Unique IP addresses:", sorted_ip_addresses)

    # Write the unique IP addresses to a file
    with open('unique_ip_addresses.txt', 'w') as output_file:
        for ip_address in sorted_ip_addresses:
            output_file.write(ip_address + "\n")
        print("Unique IP addresses written to unique_ip_addresses.txt")
else:
    print("No IP addresses found in the scan report.")

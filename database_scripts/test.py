def test_delete_task(id, user_id):
    conn.request("DELETE", "/api/task/%s"%id,headers)

    conn.request("GET", "/api/user/%s"%id,headers)


    response = conn.getresponse()
    data = response.read()
    d = json.loads(data)

    


def main():
	# Server Base URL and port
    baseurl = "localhost"
    port = 4000

    # Server to connect to (1: url, 2: port number)
    conn = http.client.HTTPConnection(baseurl, port)

    # HTTP Headers
    headers = {"Content-type": "application/x-www-form-urlencoded","Accept": "text/plain"}

    




if __name__ == '__main__':
	main()
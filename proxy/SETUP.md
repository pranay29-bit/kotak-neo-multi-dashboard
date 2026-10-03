# Run your own proxy for free (Oracle Cloud Always Free VM)

Each user runs their own proxy, so nobody else ever sees your credentials. Free-tier terms change, so check Oracle's current page. Menu names below may differ slightly.

## 1. Create the VM
1. Sign up at oracle.com/cloud/free (a card is needed for verification only).
2. Compute → Instances → Create. Choose Ubuntu and an "Always Free eligible" shape. Add your SSH public key.
3. Networking → **Reserved public IPs** → reserve one and attach it to the VM's network interface, so the IP never changes. **This IP is what you whitelist in Kotak.**
4. In the VM's subnet Security List, add ingress rules for TCP ports **80** and **443** from 0.0.0.0/0.

## 2. Free hostname
At duckdns.org, sign in, create a name (e.g. `mytrade.duckdns.org`) and point it to your reserved IP.

## 3. Install and start
SSH in, then:
```
curl -fsSL https://get.docker.com | sudo sh && sudo usermod -aG docker $USER   # log out and in again
sudo iptables -I INPUT 6 -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -p tcp --dport 443 -j ACCEPT
sudo apt-get install -y iptables-persistent && sudo netfilter-persistent save
git clone https://github.com/<you>/<repo>.git && cd <repo>/proxy
cp .env.example .env && nano .env      # set DOMAIN and ALLOWED_ORIGIN
docker compose up -d
```
(The iptables lines are needed because Oracle's Ubuntu images block these ports by default.)

## 4. Connect
1. In the dashboard, set **Proxy URL** to `https://<your-domain>` and click **Test proxy**. It shows the proxy's outgoing IP.
2. Add that IP to the Trade API static IP list in each Kotak account.
3. Log in from the dashboard. Test with dry run, then 1 quantity.

Keep the server updated and never share the proxy URL publicly. It is locked to your Pages origin and to Kotak hosts, but treat it as private.

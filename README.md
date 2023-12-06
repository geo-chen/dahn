# dahn - Deceptively Adaptive Honey Net

## Description
Traditional honey nets offer static infrastructure and static responses. In DAHN, the infrastructure is abstracted, with lambda/gpt API (prompts stipulated) returning seemingly native responses to the threat actor, depending on the complexity index defined by the administrator. In other words, responses are dynamically crafted to entrap and retain threat actors, internal and external, in this environment for as long as possible, giving them a balance of false hope and realistic obstacles as they pass through our simulated layers of defense. Our AI-powered honey net mimics a given corporate environment to create a fictitious digital twin and embeds a controlled-level of simulated vulnerabilities/weaknesses to attract, distract, learn from, and attribute threat actors. The outputs are decoys, diversion, fingerprints, IoCs and IoAs, attributes, TTPs and behaviors, and used to augment threat detection and cyber defense strategies.

## Details
The tool comes with 3 main components:
1. The detection fingerprinter analyzes traffic and matches with malicious fingerprints to decide which traffic to route to the honeynet. 
1. The honeynet leverages on AI/LLM to simulate cli-responses from a fleet of machines that resembles the corporate environment. A series of networked machines are lined up virtually to contain the adversary and distract the adversary from the real targets.  
1. The intel component collects TTPs, behaviors, fingerprints from the observed adversaries and converts them into internal intel for actions. There’s also a blue team module that can adaptively influence the adversaries’ movements. For instance, if the blue team wants to see TTPs and IoAs relating to databases, this module releases prompts to simulate vulnerable database instances to steer and lure the attacker into attempting to exploit. The intel module would then capture the on-demand and related behavioral attributes.

## Architecture
![dahn](https://github.com/geo-chen/dahn/blob/main/resources/dahn-white.png )


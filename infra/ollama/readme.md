# Ollama
We use Ollama to run LLMs locally. This allows us to run models without relying on cloud providers, and it supports a wide range of models.

## How to install
1. Install [Ollama](https://ollama.com/download) on your machine.
2. Download and run the model by running `ollama run deepseek-r1` in the terminal.
3. Try it out directly in the terminal, eg. `Tell me about Mörtebo in Sweden`.

> [!NOTE]
> Ollama uses GPU acceleration by default. You will need to run it directly on your host or enable GPU support in Docker. See [Ollama's documentation](https://ollama.com/docs/installation/docker) for more details.
>
> If you run it on the host you will need to forward the port to the devcontainer. This is already prepared in the devcontainer.json file.
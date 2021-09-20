# Base image taken from https://hub.docker.com/r/jupyter/tensorflow-notebook/tags/?page=1&ordering=last_updated
# ARG BASE_CONTAINER=jupyter/tensorflow-notebook:lab-3.1.9
ARG BASE_CONTAINER=jupyter/tensorflow-notebook:hub-1.4.2
FROM $BASE_CONTAINER

LABEL maintainer="Texas State EECS Group"

USER root

# Install C++ Kernel and fix permissions
RUN conda install --quiet --yes \
	xeus-cling -c conda-forge \
	&& \
	conda clean --all -f -y && \
	fix-permissions "${CONDA_DIR}" && \ 
	fix-permissions "/home/${NB_USER}"

# Install JupyterLab extension
WORKDIR /home/jovyan
RUN pip install --index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple jupyterlab-power-and-energy

EXPOSE 8888

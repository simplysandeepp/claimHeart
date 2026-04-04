from app.agents.extractor.agent import extractor_agent

def process_document(file_path):
    result = extractor_agent(file_path)
    return result
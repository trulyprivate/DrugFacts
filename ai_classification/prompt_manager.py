"""
Prompt manager for AI classification.

This module handles loading system prompts and building user prompts
for AI classification requests.
"""

import os
from typing import Dict, Any, Optional

from ai_classification.config import get_config
from ai_classification.logging_config import setup_logging

logger = setup_logging(__name__)


class PromptManager:
    """Manager for AI classification prompts."""
    
    def __init__(self):
        """Initialize the prompt manager."""
        config = get_config()
        self.system_prompt_path = config['SYSTEM_PROMPT_PATH']
        self.system_prompt = None
        
        # Load system prompt
        self._load_system_prompt()
    
    def _load_system_prompt(self) -> None:
        """
        Load system prompt from file.
        
        Raises:
            FileNotFoundError: If system prompt file is not found
        """
        try:
            with open(self.system_prompt_path, 'r', encoding='utf-8') as f:
                self.system_prompt = f.read()
            
            logger.info(f"Loaded system prompt from {self.system_prompt_path}")
            
        except FileNotFoundError:
            logger.error(f"System prompt file not found: {self.system_prompt_path}")
            raise FileNotFoundError(f"System prompt file not found: {self.system_prompt_path}")
        
        except Exception as e:
            logger.error(f"Error loading system prompt: {e}")
            raise
    
    def get_system_prompt(self) -> str:
        """
        Get the system prompt.
        
        Returns:
            str: System prompt
            
        Raises:
            ValueError: If system prompt is not loaded
        """
        if not self.system_prompt:
            raise ValueError("System prompt not loaded")
        
        return self.system_prompt
    
    def build_classification_prompt(self, drug_data: Dict[str, Any]) -> str:
        """
        Build classification prompt from drug data.
        
        Args:
            drug_data: Drug data dictionary
            
        Returns:
            str: Classification prompt
        """
        # Extract drug information
        drug_name = drug_data.get('drugName', 'Unknown')
        generic_name = drug_data.get('label', {}).get('genericName', 'Unknown')
        set_id = drug_data.get('setId', 'Unknown')
        
        # Extract label content
        label_content = self.extract_label_content(drug_data)
        
        # Build prompt
        prompt = f"""
**Drug Information:**

**Drug Name:** {drug_name}
**Generic Name:** {generic_name}
**Set ID:** {set_id}

**Label Content:**
{label_content}

Please analyze this drug information and provide the therapeutic classification in the specified JSON format.
        """.strip()
        
        return prompt
    
    def extract_label_content(self, drug_data: Dict[str, Any]) -> str:
        """
        Extract relevant content from drug label.
        
        Args:
            drug_data: Drug data dictionary
            
        Returns:
            str: Extracted label content
        """
        # Extract label sections
        label = drug_data.get('label', {})
        
        # Priority sections for classification
        sections = {
            'Indications and Usage': label.get('indicationsAndUsage', ''),
            'Mechanism of Action': label.get('mechanismOfAction', ''),
            'Clinical Pharmacology': label.get('clinicalPharmacology', ''),
            'Description': label.get('description', ''),
            'Dosage and Administration': label.get('dosageAndAdministration', ''),
            'Warnings and Precautions': label.get('warningsAndPrecautions', ''),
            'Adverse Reactions': label.get('adverseReactions', '')
        }
        
        # Build content string
        content = []
        for section_name, section_content in sections.items():
            if section_content:
                # Clean up HTML tags for better processing
                cleaned_content = self._clean_html(section_content)
                
                # Truncate long sections
                if len(cleaned_content) > 2000:
                    cleaned_content = cleaned_content[:2000] + "... [content truncated]"
                
                content.append(f"### {section_name}\n{cleaned_content}")
        
        return "\n\n".join(content)
    
    def _clean_html(self, html_content: str) -> str:
        """
        Clean HTML content for better processing.
        
        Args:
            html_content: HTML content
            
        Returns:
            str: Cleaned content
        """
        # Simple HTML cleaning - replace common tags with markdown
        # For a production system, consider using a proper HTML parser
        replacements = [
            ('<h1>', '# '),
            ('</h1>', '\n\n'),
            ('<h2>', '## '),
            ('</h2>', '\n\n'),
            ('<h3>', '### '),
            ('</h3>', '\n\n'),
            ('<p>', ''),
            ('</p>', '\n\n'),
            ('<ul>', ''),
            ('</ul>', '\n'),
            ('<ol>', ''),
            ('</ol>', '\n'),
            ('<li>', '- '),
            ('</li>', '\n'),
            ('<br>', '\n'),
            ('<br/>', '\n'),
            ('<strong>', '**'),
            ('</strong>', '**'),
            ('<b>', '**'),
            ('</b>', '**'),
            ('<em>', '*'),
            ('</em>', '*'),
            ('<i>', '*'),
            ('</i>', '*'),
            ('<div>', ''),
            ('</div>', '\n'),
            ('<span>', ''),
            ('</span>', '')
        ]
        
        result = html_content
        for old, new in replacements:
            result = result.replace(old, new)
        
        # Remove any remaining HTML tags
        import re
        result = re.sub(r'<[^>]*>', '', result)
        
        # Fix multiple newlines
        result = re.sub(r'\n{3,}', '\n\n', result)
        
        return result.strip()
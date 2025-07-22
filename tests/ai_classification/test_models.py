"""
Tests for AI classification data models.
"""

import pytest
from datetime import datetime
from ai_classification.models import (
    TherapeuticClassification,
    AIProcessingMetadata,
    ClassificationRequest,
    ClassificationResponse,
    EnhancedDrugDocument,
    ConfidenceLevel
)


class TestTherapeuticClassification:
    """Test cases for TherapeuticClassification model."""
    
    def test_default_values(self):
        """Test default values are set correctly."""
        classification = TherapeuticClassification()
        assert classification.primary_therapeutic_class == "Not specified"
        assert classification.pharmacological_class == "Not specified"
        assert classification.chemical_class == "Not specified"
        assert classification.atc_code == "Not specified"
        assert classification.controlled_substance_schedule == "Not specified"
        assert classification.therapeutic_indication == "Not specified"
        assert classification.mechanism_of_action_summary == "Not specified"
        assert classification.confidence_level == ConfidenceLevel.LOW
        assert classification.source_sections_used == []
    
    def test_to_dict(self):
        """Test conversion to dictionary."""
        classification = TherapeuticClassification(
            primary_therapeutic_class="Antidiabetic Agents",
            pharmacological_class="GLP-1 Receptor Agonists",
            confidence_level=ConfidenceLevel.HIGH,
            source_sections_used=["indicationsAndUsage", "mechanismOfAction"]
        )
        
        result = classification.to_dict()
        assert result["primary_therapeutic_class"] == "Antidiabetic Agents"
        assert result["pharmacological_class"] == "GLP-1 Receptor Agonists"
        assert result["confidence_level"] == "High"
        assert result["source_sections_used"] == ["indicationsAndUsage", "mechanismOfAction"]
    
    def test_from_dict(self):
        """Test creation from dictionary."""
        data = {
            "primary_therapeutic_class": "Cardiovascular Agents",
            "pharmacological_class": "ACE Inhibitors",
            "chemical_class": "Peptides",
            "confidence_level": "Medium",
            "source_sections_used": ["indicationsAndUsage"]
        }
        
        classification = TherapeuticClassification.from_dict(data)
        assert classification.primary_therapeutic_class == "Cardiovascular Agents"
        assert classification.pharmacological_class == "ACE Inhibitors"
        assert classification.chemical_class == "Peptides"
        assert classification.confidence_level == ConfidenceLevel.MEDIUM
        assert classification.source_sections_used == ["indicationsAndUsage"]
    
    def test_from_dict_with_missing_fields(self):
        """Test creation from dictionary with missing fields uses defaults."""
        data = {"primary_therapeutic_class": "Test Class"}
        
        classification = TherapeuticClassification.from_dict(data)
        assert classification.primary_therapeutic_class == "Test Class"
        assert classification.pharmacological_class == "Not specified"
        assert classification.confidence_level == ConfidenceLevel.LOW
        assert classification.source_sections_used == []
    
    def test_from_dict_invalid_confidence_level(self):
        """Test creation from dictionary with invalid confidence level defaults to LOW."""
        data = {
            "primary_therapeutic_class": "Test Class",
            "confidence_level": "Invalid"
        }
        
        classification = TherapeuticClassification.from_dict(data)
        assert classification.confidence_level == ConfidenceLevel.LOW


class TestAIProcessingMetadata:
    """Test cases for AIProcessingMetadata model."""
    
    def test_creation(self):
        """Test metadata creation."""
        now = datetime.utcnow()
        metadata = AIProcessingMetadata(
            processed_at=now,
            model_used="gpt-4o-mini",
            confidence="High",
            tokens_used=800,
            processing_time_ms=1500,
            cached=False
        )
        
        assert metadata.processed_at == now
        assert metadata.model_used == "gpt-4o-mini"
        assert metadata.confidence == "High"
        assert metadata.tokens_used == 800
        assert metadata.processing_time_ms == 1500
        assert metadata.cached is False
        assert metadata.error_message is None
    
    def test_to_dict(self):
        """Test conversion to dictionary."""
        now = datetime.utcnow()
        metadata = AIProcessingMetadata(
            processed_at=now,
            model_used="gpt-4o-mini",
            confidence="High",
            tokens_used=800
        )
        
        result = metadata.to_dict()
        assert result["processed_at"] == now
        assert result["model_used"] == "gpt-4o-mini"
        assert result["confidence"] == "High"
        assert result["tokens_used"] == 800
    
    def test_from_dict(self):
        """Test creation from dictionary."""
        now = datetime.utcnow()
        data = {
            "processed_at": now,
            "model_used": "gpt-4o-mini",
            "confidence": "Medium",
            "tokens_used": 600,
            "processing_time_ms": 2000,
            "cached": True,
            "error_message": "Test error"
        }
        
        metadata = AIProcessingMetadata.from_dict(data)
        assert metadata.processed_at == now
        assert metadata.model_used == "gpt-4o-mini"
        assert metadata.confidence == "Medium"
        assert metadata.tokens_used == 600
        assert metadata.processing_time_ms == 2000
        assert metadata.cached is True
        assert metadata.error_message == "Test error"


class TestClassificationRequest:
    """Test cases for ClassificationRequest model."""
    
    def test_creation_and_to_dict(self):
        """Test request creation and conversion to dictionary."""
        request = ClassificationRequest(
            drug_name="Mounjaro",
            generic_name="tirzepatide",
            set_id="d2d7da5d-ad07-4228-955f-cf7e355c8cc0",
            label_content="Test label content"
        )
        
        result = request.to_dict()
        assert result["drug_name"] == "Mounjaro"
        assert result["generic_name"] == "tirzepatide"
        assert result["set_id"] == "d2d7da5d-ad07-4228-955f-cf7e355c8cc0"
        assert result["label_content"] == "Test label content"


class TestClassificationResponse:
    """Test cases for ClassificationResponse model."""
    
    def test_creation_and_to_dict(self):
        """Test response creation and conversion to dictionary."""
        classification = TherapeuticClassification(
            primary_therapeutic_class="Antidiabetic Agents"
        )
        metadata = AIProcessingMetadata(
            processed_at=datetime.utcnow(),
            model_used="gpt-4o-mini",
            confidence="High"
        )
        
        response = ClassificationResponse(
            classification=classification,
            processing_metadata=metadata
        )
        
        result = response.to_dict()
        assert "classification" in result
        assert "processing_metadata" in result
        assert result["classification"]["primary_therapeutic_class"] == "Antidiabetic Agents"
        assert result["processing_metadata"]["model_used"] == "gpt-4o-mini"


class TestEnhancedDrugDocument:
    """Test cases for EnhancedDrugDocument model."""
    
    def test_creation_and_to_dict(self):
        """Test enhanced document creation and conversion to dictionary."""
        base_doc = {
            "drugName": "Mounjaro",
            "setId": "d2d7da5d-ad07-4228-955f-cf7e355c8cc0",
            "slug": "mounjaro-d2d7da5"
        }
        
        classification = TherapeuticClassification(
            primary_therapeutic_class="Antidiabetic Agents"
        )
        metadata = AIProcessingMetadata(
            processed_at=datetime.utcnow(),
            model_used="gpt-4o-mini",
            confidence="High"
        )
        
        enhanced_doc = EnhancedDrugDocument(
            base_document=base_doc,
            therapeutic_class=classification,
            ai_processing_metadata=metadata
        )
        
        result = enhanced_doc.to_dict()
        
        # Check base document fields are preserved
        assert result["drugName"] == "Mounjaro"
        assert result["setId"] == "d2d7da5d-ad07-4228-955f-cf7e355c8cc0"
        assert result["slug"] == "mounjaro-d2d7da5"
        
        # Check AI enhancement fields are added
        assert "therapeuticClass" in result
        assert "aiProcessingMetadata" in result
        assert result["therapeuticClass"]["primary_therapeutic_class"] == "Antidiabetic Agents"
        assert result["aiProcessingMetadata"]["model_used"] == "gpt-4o-mini"
"""
Data models for AI therapeutic classification.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ConfidenceLevel(Enum):
    """Confidence levels for AI classification."""
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


@dataclass
class TherapeuticClassification:
    """Therapeutic classification data structure."""
    
    primary_therapeutic_class: str = "Not specified"
    pharmacological_class: str = "Not specified"
    chemical_class: str = "Not specified"
    atc_code: str = "Not specified"
    controlled_substance_schedule: str = "Not specified"
    therapeutic_indication: str = "Not specified"
    mechanism_of_action_summary: str = "Not specified"
    confidence_level: ConfidenceLevel = ConfidenceLevel.LOW
    source_sections_used: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for MongoDB storage."""
        return {
            "primary_therapeutic_class": self.primary_therapeutic_class,
            "pharmacological_class": self.pharmacological_class,
            "chemical_class": self.chemical_class,
            "atc_code": self.atc_code,
            "controlled_substance_schedule": self.controlled_substance_schedule,
            "therapeutic_indication": self.therapeutic_indication,
            "mechanism_of_action_summary": self.mechanism_of_action_summary,
            "confidence_level": self.confidence_level.value,
            "source_sections_used": self.source_sections_used
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'TherapeuticClassification':
        """Create from dictionary (e.g., from MongoDB or AI response)."""
        confidence_str = data.get("confidence_level", "Low")
        confidence_level = ConfidenceLevel.LOW
        
        for level in ConfidenceLevel:
            if level.value == confidence_str:
                confidence_level = level
                break
        
        return cls(
            primary_therapeutic_class=data.get("primary_therapeutic_class", "Not specified"),
            pharmacological_class=data.get("pharmacological_class", "Not specified"),
            chemical_class=data.get("chemical_class", "Not specified"),
            atc_code=data.get("atc_code", "Not specified"),
            controlled_substance_schedule=data.get("controlled_substance_schedule", "Not specified"),
            therapeutic_indication=data.get("therapeutic_indication", "Not specified"),
            mechanism_of_action_summary=data.get("mechanism_of_action_summary", "Not specified"),
            confidence_level=confidence_level,
            source_sections_used=data.get("source_sections_used", [])
        )


@dataclass
class AIProcessingMetadata:
    """Metadata about AI processing."""
    
    processed_at: datetime
    model_used: str
    confidence: str
    tokens_used: int = 0
    processing_time_ms: int = 0
    cached: bool = False
    error_message: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for MongoDB storage."""
        return {
            "processed_at": self.processed_at,
            "model_used": self.model_used,
            "confidence": self.confidence,
            "tokens_used": self.tokens_used,
            "processing_time_ms": self.processing_time_ms,
            "cached": self.cached,
            "error_message": self.error_message
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'AIProcessingMetadata':
        """Create from dictionary."""
        return cls(
            processed_at=data.get("processed_at", datetime.utcnow()),
            model_used=data.get("model_used", "unknown"),
            confidence=data.get("confidence", "Low"),
            tokens_used=data.get("tokens_used", 0),
            processing_time_ms=data.get("processing_time_ms", 0),
            cached=data.get("cached", False),
            error_message=data.get("error_message")
        )


@dataclass
class ClassificationRequest:
    """Request data for AI classification."""
    
    drug_name: str
    generic_name: str
    set_id: str
    label_content: str
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "drug_name": self.drug_name,
            "generic_name": self.generic_name,
            "set_id": self.set_id,
            "label_content": self.label_content
        }


@dataclass
class ClassificationResponse:
    """Response from AI classification."""
    
    classification: TherapeuticClassification
    processing_metadata: AIProcessingMetadata
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "classification": self.classification.to_dict(),
            "processing_metadata": self.processing_metadata.to_dict()
        }


@dataclass
class EnhancedDrugDocument:
    """Enhanced drug document with AI classification."""
    
    # Base drug document fields (from existing system)
    base_document: Dict[str, Any]
    
    # AI enhancement fields
    therapeutic_class: TherapeuticClassification
    ai_processing_metadata: AIProcessingMetadata
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for MongoDB storage."""
        result = self.base_document.copy()
        result.update({
            "therapeuticClass": self.therapeutic_class.to_dict(),
            "aiProcessingMetadata": self.ai_processing_metadata.to_dict()
        })
        return result